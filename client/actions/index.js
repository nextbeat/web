import { List, Map } from 'immutable'
import Schemas from '../schemas'
import fetch from 'isomorphic-fetch'
import { normalize } from 'normalizr'
import { assign } from 'lodash'
import { Stack, CurrentUser } from '../models'

/***********
 * API CALLS
 ***********/

import { API_CALL } from '../middleware/api'

export const ENTITY_UPDATE = 'ENTITY_UPDATE';

export const STACK = 'STACK';
export const USER_OPEN_STACKS = 'USER_OPEN_STACKS';
export const USER_CLOSED_STACKS = 'USER_CLOSED_STACKS';
export const MEDIA_ITEMS = 'MEDIA_ITEMS';
export const COMMENTS = 'COMMENTS';
export const BOOKMARKED_STACKS = 'BOOKMARKED_STACKS';
export const SEND_COMMENT = 'SEND_COMMENT';
export const BOOKMARK = 'BOOKMARK';
export const UNBOOKMARK = 'UNBOOKMARK';
export const USER = 'USER';

export const Status = {
    REQUESTING: 'REQUESTING',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
    RESET: 'RESET'
}

function onStackSuccess(store, next, action, response) {
    const stack = response.entities.stacks[response.result];
    store.dispatch(loadMediaItems(stack.uuid));
    store.dispatch(loadComments(stack.uuid));
}

function fetchStack(id) {
    return {
        type: STACK,
        id: id,
        [API_CALL]: {
            schema: Schemas.STACK,
            endpoint: `stack?id=${id}`,
            onSuccess: onStackSuccess
        }
    }
}

export function loadStack(id) {
    return fetchStack(id);
}

function onProfileSuccess(store, next, action, response) {
    const profile = response.entities.users[response.result];
    store.dispatch(loadOpenStacksForUser(profile.username))
    store.dispatch(loadClosedStacksForUser(profile.username))
}

function fetchProfile(username) {
    return {
        type: USER,
        [API_CALL]: {
            schema: Schemas.USER,
            endpoint: `users/${username}`,
            onSuccess: onProfileSuccess
        }
    }
}

export function loadProfile(username) {
    return fetchProfile(username);
}

// PAGINATION

// todo: api server should handle stack_id inputs
// todo: return nextUrl in api server?
function loadPaginatedObjects(modelKey, objectKey, action, defaultLimit=20) {
    return (dispatch, getState) => {

        const { 
            page = 0, 
            limit = defaultLimit, 
            total = -1,
            beforeDate = Date.now(),
            ids = []
        } = getState().getIn([modelKey, 'pagination', objectKey], Map()).toJS()

        if (total >= 0 && total <= ids.length) {
            // reached the end of the list of objects
            return null;
        }

        const pagination = {
            page: page+1,
            limit,
            beforeDate
        };

        return dispatch(action(pagination));
    }
}

function fetchMediaItems(stack_uuid, pagination) {
    return {
        type: MEDIA_ITEMS,
        [API_CALL]: {
            schema: Schemas.MEDIA_ITEMS,
            endpoint: `stacks/${stack_uuid}/mediaitems`,
            pagination
        }
    }
}

export function loadMediaItems(stack_uuid) {
    return loadPaginatedObjects('stack', 'mediaItems', fetchMediaItems.bind(this, stack_uuid), "all");
}

function fetchComments(stack_uuid, pagination) {
    return {
        type: COMMENTS,
        [API_CALL]: {
            schema: Schemas.COMMENTS,
            endpoint: `stacks/${stack_uuid}/comments`,
            pagination
        }
    }
}

export function loadComments(stack_uuid) {
    return loadPaginatedObjects('stack', 'comments', fetchComments.bind(this, stack_uuid), 25);
}

function fetchBookmarkedStacks(pagination) {
    return {
        type: BOOKMARKED_STACKS,
        [API_CALL]: {
            schema: Schemas.STACKS,
            endpoint: `stacks/bookmarked`,
            authenticated: true,
            pagination
        }
    }
}

export function loadBookmarkedStacks() {
    // we don't use loadPaginatedObjects because we want
    // to be able to refresh this without incrementing the 
    // page, setting a beforeDate, etc
    return fetchBookmarkedStacks({
        limit: "all",
        page: "1"
    })
}

function fetchStacksForUser(username, type, status, pagination) {
    return {
        type,
        [API_CALL]: {
            schema: Schemas.STACKS,
            endpoint: `stacks`,
            queries: { author: username, status: status },
            pagination
        }
    }
}

export function loadOpenStacksForUser(username) {
    return loadPaginatedObjects('profile', 'stacks', fetchStacksForUser.bind(this, username, USER_OPEN_STACKS, "open"), "all");
}

export function loadClosedStacksForUser(username) {
    // TODO: paginate closed stacks
    return loadPaginatedObjects('profile', 'stacks', fetchStacksForUser.bind(this, username, USER_CLOSED_STACKS, "closed", "all"));
}

// POST REQUESTS

function postComment(stack_id, message) {
    return {
        type: SEND_COMMENT,
        message,
        [API_CALL]: {
            method: 'POST',
            endpoint: `stacks/${stack_id}/comments`,
            body: { message },
            authenticated: true
        }
    }
}

export function sendComment(message) {
    return (dispatch, getState) => {

        const stack = new Stack(getState())
        const id = stack.get('id', 0)
        if (id === 0) {
            return null;
        }

        return dispatch(postComment(id, message));
    }
}

function onBookmarkSuccess(store, next, action, response) {
    const stack = new Stack(store.getState())
    const newStack = {
        id: stack.get('id'),
        bookmark_count: stack.get('bookmark_count', 0) + 1
    }
    store.dispatch({
        type: ENTITY_UPDATE,
        response: normalize(newStack, Schemas.STACK)
    })
}

function postBookmark(stack_id) {
    return {
        type: BOOKMARK,
        id: stack_id,
        [API_CALL]: {
            method: 'POST',
            endpoint: `stacks/${stack_id}/bookmark`,
            authenticated: true,
            onSuccess: onBookmarkSuccess
        }
    }
}

function onUnbookmarkSuccess(store, next, action, response) {
    const stack = new Stack(store.getState())
    const newStack = {
        id: stack.get('id'),
        bookmark_count: stack.get('bookmark_count', 1) - 1
    }
    store.dispatch({
        type: ENTITY_UPDATE,
        response: normalize(newStack, Schemas.STACK)
    })
}

function postUnbookmark(stack_id) {
    return {
        type: UNBOOKMARK,
        id: stack_id,
        [API_CALL]: {
            method: 'POST',
            endpoint: `stacks/${stack_id}/unbookmark`,
            authenticated: true,
            onSuccess: onUnbookmarkSuccess
        }
    }
}

export function bookmark() {
    return (dispatch, getState) => {

        const stack = new Stack(getState())
        const id = stack.get('id')
        if (!id || stack.isBookmarked()) {
            return null;
        }

        return dispatch(postBookmark(id));
    }
}

export function unbookmark() {
    return (dispatch, getState) => {

        const stack = new Stack(getState())
        const id = stack.get('id')
        if (!id || !stack.isBookmarked()) {
            return null;
        }
        
        return dispatch(postUnbookmark(id));
    }
}


/**********************
 * MEDIA ITEM SELECTION
 **********************/

export const SELECT_MEDIA_ITEM = 'SELECT_MEDIA_ITEM';

export function selectMediaItem(id) {
    return {
        type: SELECT_MEDIA_ITEM,
        id 
    }
}

function navigate(isForward) {
    return (dispatch, getState) => {
        const stack = new Stack(getState())
        let selectedId = stack.get('selectedMediaItemId', -1)
        if (selectedId === -1) {
            return null;
        }

        const paginatedIds = stack.get('mediaItemIds', List())
        const liveIds = stack.get('liveMediaItemIds', List())
        const ids = paginatedIds.concat(liveIds);
        const selectedIndex = ids.indexOf(selectedId);

        if (selectedIndex == -1) {
            return null;
        }
        if (isForward && selectedIndex === ids.size-1) {
            return null;
        }
        if (!isForward && selectedIndex === 0) {
            return null;
        }

        const nextIndex = isForward ? selectedIndex+1 : selectedIndex-1;
        selectedId = ids.get(nextIndex);

        return dispatch(selectMediaItem(selectedId));
    }
}

export function goForward() {
    return navigate(true);
}

export function goBackward() {
    return navigate(false);
}

/*******
 * LOGIN
 *******/

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

export function login(username, password) {
    return (dispatch, getState) => {
        // exit early if already logged in
        const currentUser = new CurrentUser(getState())
        if (currentUser.isLoggedIn()) {
            return null;
        }

        function actionWith(status, data) {
            return assign({ type: LOGIN }, { status }, data)
        }

        dispatch(actionWith(Status.REQUESTING));

        fetch('/login', { 
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username, 
                password
            })
        })
        .then(res => res.json().then(json => ({json, res})))
        .then(({json, res}) => {
            if (!res.ok) {
                return dispatch(actionWith(Status.FAILURE, json))
            }
            dispatch(actionWith(Status.SUCCESS, { user: json }))
            // we wait until the next tick so the reducer updates state first
            process.nextTick(() => {
                dispatch(loadBookmarkedStacks())
            })
        });
    }
}

export function logout() {
    return (dispatch, getState) => {
        // exit early if already logged out
        const currentUser = new CurrentUser(getState())
        if (!currentUser.isLoggedIn()) {
            return null;
        }

        function actionWith(status, data) {
            return assign({ type: LOGOUT }, { status }, data)
        }

        dispatch(actionWith(Status.REQUESTING));

        fetch('/logout', {
            method: 'POST',
            credentials: 'same-origin'
        })
        .then(res => {
            if (!res.ok) {
                return dispatch(actionWith(Status.FAILURE));
            }
            return dispatch(actionWith(Status.SUCCESS));
        });
    }
}

/*****************
 * XMPP CONNECTION
 *****************/

export const CONNECT_XMPP = 'CONNECT_XMPP';
export const DISCONNECT_XMPP = 'DISCONNECT_XMPP';
export const JOIN_ROOM = 'JOIN_ROOM';
export const LEAVE_ROOM = 'LEAVE_ROOM';
export const RECEIVE_COMMENT = 'RECEIVE_COMMENT';
export const RECEIVE_NOTIFICATION_COMMENT = 'RECEIVE_NOTIFICATION_COMMENT';
export const RECEIVE_MEDIA_ITEM = 'RECEIVE_MEDIA_ITEM';
export const RECEIVE_STACK_CLOSED = 'RECEIVE_STACK_CLOSED';

export function connectToXMPP() {
    return {
        type: CONNECT_XMPP
    }
}

export function disconnectXMPP() {
    return {
        type: DISCONNECT_XMPP
    }
}

export function joinRoom() {
    return {
        type: JOIN_ROOM
    }
}

export function leaveRoom() {
    return {
        type: LEAVE_ROOM
    }
}

export function receiveComment(message, username) {
    return {
        type: RECEIVE_COMMENT,
        message,
        username
    }
}

export function receiveNotificationComment(data, username) {
    return {
        type: RECEIVE_NOTIFICATION_COMMENT,
        data,
        username
    }
}   

export function receiveMediaItem(id, response) {
    return {
        type: RECEIVE_MEDIA_ITEM,
        id,
        response
    }
}

export function receiveStackClosed() {
    return {
        type: RECEIVE_STACK_CLOSED
    }
}

/******
* RESET
*******/

export const CLEAR_STACK = 'CLEAR_STACK'
export const CLEAR_PROFILE = 'CLEAR_PROFILE'

export function clearStack() {
    return {
        type: CLEAR_STACK
    }
}

export function clearProfile() {
    return {
        type: CLEAR_PROFILE
    }
}
