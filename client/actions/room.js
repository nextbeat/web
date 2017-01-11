import { List } from 'immutable'
import { normalize } from 'normalizr'
import { browserHistory } from 'react-router'

import ActionTypes from './types'
import Schemas from '../schemas'
import { markStackAsRead } from './notifications'
import { promptModal } from './app'
import { pushSubscribe } from './push'
import { loadPaginatedObjects } from './utils'
import { Room, RoomPage } from '../models'
import { API_CALL, API_CANCEL, GA, AnalyticsTypes, GATypes } from './types'
import { setStorageItem } from '../utils'


/**********
 * FETCHING
 **********/

function fetchRoom(id) {
    return {
        type: ActionTypes.ROOM,
        roomId: id,
        [API_CALL]: {
            schema: Schemas.STACK,
            endpoint: `stacks/${id}`
        }
    }
}

export function loadRoom(id) {
    return dispatch => {
        dispatch(fetchRoom(id))
        dispatch(loadMediaItems(id));
        dispatch(loadComments(id));
        dispatch(loadCommentsMetadata(id));
    }
}

function fetchMediaItems(roomId, pagination) {
    return {
        type: ActionTypes.MEDIA_ITEMS,
        roomId,
        [API_CALL]: {
            schema: Schemas.MEDIA_ITEMS,
            endpoint: `stacks/${roomId}/mediaitems`,
            pagination
        }
    }
}

export function loadMediaItems(roomId) {
    return loadPaginatedObjects(['rooms', roomId, 'pagination', 'mediaItems'], fetchMediaItems.bind(this, roomId), "all");
}

function fetchComments(roomId, pagination) {
    return {
        type: ActionTypes.COMMENTS,
        roomId,
        [API_CALL]: {
            schema: Schemas.COMMENTS,
            endpoint: `stacks/${roomId}/comments`,
            pagination
        }
    }
}

export function loadComments(roomId) {
    return loadPaginatedObjects(['rooms', roomId, 'pagination', 'comments'], fetchComments.bind(this, roomId), 60);
}

/******
 * CHAT
 ******/

function postComment(roomId, message) {
    return {
        type: ActionTypes.SEND_COMMENT,
        roomId,
        message,
        [API_CALL]: {
            method: 'POST',
            endpoint: `stacks/${roomId}/comments`,
            body: { message },
            authenticated: true
        },
        [GA]: {
            type: GATypes.EVENT,
            category: 'chat',
            action: 'send',
            label: roomId
        }
    }
}

export function sendComment(roomId, message) {
    return (dispatch, getState) => {

        if (!message || message.trim().length === 0) {
            return null;
        }

        return dispatch(postComment(roomId, message));
    }
}

function onCommentsMetadataSuccess(store, next, action, response) {
    store.dispatch({
        type: ActionTypes.ENTITY_UPDATE,
        response: normalize(response.banned_users, Schemas.USERS)
    })
}


function fetchCommentsMetadata(roomId) {
    return {
        type: ActionTypes.COMMENTS_METADATA,
        roomId,
        [API_CALL]: {
            endpoint: `stacks/${roomId}/comments/meta`,
            onSuccessImmediate: onCommentsMetadataSuccess
        }
    }
}

export function loadCommentsMetadata(roomId) {
    return (dispatch, getState) => {
        const stack = new Room(roomId, getState())
        if (!stack.currentUserIsAuthor()) {
            return null;
        }
        dispatch(fetchCommentsMetadata(roomId))
    }   
}

export function didUseChat() {
    // Dispatch this action whenever the client interacts with
    // the chat in some way (scrolls, focuses on text box, etc)
    // which tells analytics tracker to prolong the chat session
    return {
        type: ActionTypes.USE_CHAT
    }
}

/*************
 * BOOKMARKING
 *************/

function onBookmarkSuccess(store, next, action, response) {
    const stack = (new RoomPage(store.getState())).entity()
    const newStack = {
        id: stack.get('id'),
        bookmark_count: stack.get('bookmark_count', 0) + 1,
        bookmarked: true
    }
    store.dispatch({
        type: ActionTypes.ENTITY_UPDATE,
        response: normalize(newStack, Schemas.STACK)
    })
}

function postBookmark(stack_id, stackStatus) {
    return {
        type: ActionTypes.BOOKMARK,
        id: stack_id,
        stackStatus,
        [API_CALL]: {
            method: 'POST',
            endpoint: `stacks/${stack_id}/bookmark`,
            authenticated: true,
            onSuccess: onBookmarkSuccess
        }
    }
}

function onUnbookmarkSuccess(store, next, action, response) {
    const stack = (new RoomPage(store.getState())).entity()
    const newStack = {
        id: stack.get('id'),
        bookmark_count: stack.get('bookmark_count', 1) - 1,
        bookmarked: false
    }
    store.dispatch({
        type: ActionTypes.ENTITY_UPDATE,
        response: normalize(newStack, Schemas.STACK)
    })
}

function postUnbookmark(stack_id, stackStatus) {
    return {
        type: ActionTypes.UNBOOKMARK,
        id: stack_id,
        stackStatus,
        [API_CALL]: {
            method: 'POST',
            endpoint: `stacks/${stack_id}/unbookmark`,
            authenticated: true,
            onSuccess: onUnbookmarkSuccess
        }
    }
}

export function bookmark(roomId) {
    return (dispatch, getState) => {

        const room = new Room(roomId, getState())
        const status = room.status()
        if (room.isBookmarked() || room.currentUserIsAuthor()) {
            return null;
        }

        return dispatch(postBookmark(roomId, status));
    }
}

export function unbookmark(roomId) {
    return (dispatch, getState) => {

        const room = new Room(roomId, getState())
        const status = room.status()
        if (!room.isBookmarked() || room.currentUserIsAuthor()) {
            return null;
        }
        
        return dispatch(postUnbookmark(roomId, status));
    }
}


/**********
 * PLAYBACK
 **********/

export function didPlayVideo(roomId) {
    // Dispatch this function when user plays
    // a video in the room. Used in the room card
    // to mark when a video has already been played
    // so we can set the autoplay flag.
    return {
        type: ActionTypes.DID_PLAY_VIDEO,
        roomId
    }
}


/**********************
 * MEDIA ITEM SELECTION
 **********************/

function performSelectMediaItem(roomId, id) {
    return {
        type: ActionTypes.SELECT_MEDIA_ITEM,
        roomId,
        id 
    }
}

export function selectMediaItem(roomId, id) {
    // We store the last selected media item from each stack
    // in the session in localStorage, so that it persists
    // through multiple sessions
    return (dispatch, getState) => {

        const roomPage = new RoomPage(getState())
        if (roomPage.isLoaded()) {
            setStorageItem(roomPage.get('hid'), id)
            var index = roomPage.indexOfMediaItem(id)
            browserHistory.push(`/r/${roomPage.get('hid')}/${index+1}`)
        }


        return dispatch(performSelectMediaItem(roomId, id))
    }
}

function navigate(roomId, isForward) {
    return (dispatch, getState) => {
        const room = new Room(roomId, getState())
        let selectedId = room.get('selectedMediaItemId', -1)
        if (selectedId === -1) {
            return null;
        }

        const paginatedIds = room.get('mediaItemIds', List())
        const liveIds = room.get('liveMediaItemIds', List())
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

        return dispatch(selectMediaItem(roomId, selectedId));
    }
}

export function goForward(roomId) {
    return navigate(roomId, true);
}

export function goBackward(roomId) {
    return navigate(roomId, false);
}


/*******
 * RESET
 *******/

// TODO: expand into clearRoom(?), clearMediaItems, clearComments

export function clearComments(roomId) {
    return {
        type: ActionTypes.CLEAR_COMMENTS,
        roomId
    }
}

export function clearRoom(roomId) {
    return {
        type: ActionTypes.CLEAR_ROOM,
        roomId,
        [API_CANCEL]: {
            actionTypes: [ActionTypes.COMMENTS, ActionTypes.MEDIA_ITEMS, ActionTypes.ROOM]
        }
    }
}

