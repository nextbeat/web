import { List, Map } from 'immutable'
import Schemas from '../schemas'
import fetch from 'isomorphic-fetch'
import { assign } from 'lodash'

/***********
 * API CALLS
 ***********/

import { API_CALL } from '../middleware/api'

export const STACK = 'STACK';
export const MEDIA_ITEMS = 'MEDIA_ITEMS';
export const COMMENTS = 'COMMENTS';
export const POST_COMMENT = 'POST_COMMENT';

export const Status = {
    REQUESTING: 'REQUESTING',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE'
}

function fetchStack(id) {
    return {
        type: STACK,
        id: id,
        [API_CALL]: {
            schema: Schemas.STACK,
            endpoint: `stacks?id=${id}`
        }
    }
}

// todo: handle caching
export function loadStack(id) {
    return fetchStack(id);
}

// todo: api server should handle stack_id inputs
// todo: return nextUrl in api server?
// todo: handle caching
function loadPaginatedObjects(key, action, defaultLimit=20) {
    return (dispatch, getState) => {

        const stack_id = getState().getIn(['stack', 'id'], 0);
        if (stack_id === 0) {
            return null;
        }

        const stack_uuid = getState().getIn(['entities', 'stacks', stack_id, 'uuid']);

        const { 
            page = 0, 
            limit = defaultLimit, 
            total = -1,
            beforeDate = Date.now(),
            ids = []
        } = getState().getIn(['pagination', key], {}).toJS();

        if (total >= 0 && total <= ids.length) {
            // reached the end of the list of objects
            return null;
        }

        const pagination = {
            page: page+1,
            limit,
            beforeDate
        };

        return dispatch(action(stack_uuid, pagination));
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

export function loadMediaItems() {
    // loading all media items at once to avoid pagination/live issues
    return loadPaginatedObjects('mediaItems', fetchMediaItems, "all");
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

export function loadComments() {
    return loadPaginatedObjects('comments', fetchComments, 25);
}

function postComment(stack_id, message) {
    return {
        type: POST_COMMENT,
        [API_CALL]: {
            method: 'POST',
            endpoint: `stacks/${stack_id}/comments`,
            body: { message }
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
        let selectedId = getState().get('mediaItems').get('selected', -1);
        if (selectedId == -1) {
            return null;
        }

        const paginatedIds = getState().getIn(['pagination', 'mediaItems', 'ids'], List())
        const liveIds = getState().getIn(['live', 'mediaItems'], List())
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

