import { List, Map } from 'immutable'
import Schemas from '../schemas'
import fetch from 'isomorphic-fetch'
import { assign } from 'lodash'
import { getEntity } from '../utils'

/***********
 * API CALLS
 ***********/

import { API_CALL } from '../middleware/api'

export const STACK = 'STACK';
export const USER_OPEN_STACKS = 'USER_OPEN_STACKS';
export const USER_CLOSED_STACKS = 'USER_CLOSED_STACKS';
export const MEDIA_ITEMS = 'MEDIA_ITEMS';
export const COMMENTS = 'COMMENTS';
export const SEND_COMMENT = 'SEND_COMMENT';
export const USER = 'USER';

export const Status = {
    REQUESTING: 'REQUESTING',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
    RESET: 'RESET'
}

function onStackSuccess(store, response) {
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

function onProfileSuccess(store, response) {
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

function getStackUuid(state) {
    const stack_id = state.getIn(['stack', 'id'], 0);
    if (stack_id === 0) {
        return null;
    }

    const stack_uuid = getEntity(state, 'stacks', stack_id).get('uuid');
    return stack_uuid;
} 

// todo: api server should handle stack_id inputs
// todo: return nextUrl in api server?
function loadPaginatedObjects(page, key, action, defaultLimit=20) {
    return (dispatch, getState) => {

        const { 
            page = 0, 
            limit = defaultLimit, 
            total = -1,
            beforeDate = Date.now(),
            ids = []
        } = getState().getIn([page, 'pagination', key], Map()).toJS()

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

        const stack_id = getState().getIn(['stack', 'id'], 0);
        if (stack_id === 0) {
            return null;
        }

        return dispatch(postComment(stack_id, message));
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
        let selectedId = getState().getIn(['stack', 'mediaItems', 'selected'], -1)
        if (selectedId == -1) {
            return null;
        }

        const paginatedIds = getState().getIn(['stack', 'pagination', 'mediaItems', 'ids'], List())
        const liveIds = getState().getIn(['stack', 'live', 'mediaItems'], List())
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
        if (getState().hasIn(['user', 'id'])) {
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
            return dispatch(actionWith(Status.SUCCESS, { user: json }))
        });
    }
}

export function logout() {
    return (dispatch, getState) => {
        // exit early if already logged out
        if (!getState().hasIn(['user', 'id'])) {
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

export const XMPP_CONNECTION = 'CONNECT_TO_XMPP';
export const JOIN_ROOM = 'JOIN_ROOM';
export const RECEIVE_COMMENT = 'RECEIVE_COMMENT';
export const RECEIVE_NOTIFICATION_COMMENT = 'RECEIVE_NOTIFICATION_COMMENT';
export const RECEIVE_MEDIA_ITEM = 'RECEIVE_MEDIA_ITEM';
export const CHANGE_NICKNAME = 'CHANGE_NICKNAME';

export function connectToXMPP() {
    return {
        type: XMPP_CONNECTION
    }
}

export function joinRoom(uuid, nickname="anon") {
    if (Map.isMap(uuid)) {
        // passed the stack object
        uuid = uuid.get('uuid');
    }
    uuid = uuid.toLowerCase();
    return {
        type: JOIN_ROOM,
        uuid,
        nickname
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

export function changeNickname(nickname) {
    return {
        type: CHANGE_NICKNAME,
        nickname
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
