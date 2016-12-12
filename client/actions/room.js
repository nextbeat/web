import { List } from 'immutable'
import { normalize } from 'normalizr'
import { browserHistory } from 'react-router'

import ActionTypes from './types'
import Schemas from '../schemas'
import { markStackAsRead } from './notifications'
import { promptModal } from './app'
import { pushSubscribe } from './push'
import { loadPaginatedObjects } from './utils'
import { Stack } from '../models'
import { API_CALL, API_CANCEL, GA, AnalyticsTypes, GATypes } from './types'
import { setStorageItem } from '../utils'


/**********
 * FETCHING
 **********/

function onRoomSuccess(store, next, action, response) {
    const stack = response.entities.stacks[response.result];
    store.dispatch(loadMediaItems(stack.uuid));
    store.dispatch(loadComments(stack.uuid));
    store.dispatch(loadCommentsMetadata(stack.uuid));
}

function fetchRoom(id) {
    return {
        type: ActionTypes.ROOM,
        [API_CALL]: {
            schema: Schemas.STACK,
            endpoint: `stacks/${id}`,
            onSuccess: onRoomSuccess
        }
    }
}

export function loadRoom(hid, { loadAsPage }) {
    return fetchRoom(hid, loadAsPage)
}

function fetchMediaItems(stack_uuid, pagination) {
    return {
        type: ActionTypes.MEDIA_ITEMS,
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
        type: ActionTypes.COMMENTS,
        [API_CALL]: {
            schema: Schemas.COMMENTS,
            endpoint: `stacks/${stack_uuid}/comments`,
            pagination
        }
    }
}

export function loadComments(stack_uuid) {

    return loadPaginatedObjects('stack', 'comments', fetchComments.bind(this, stack_uuid), 60);
}

function clearComments() {
    return {
        type: ActionTypes.CLEAR_COMMENTS
    }
}

export function resetComments() {
    return (dispatch, getState) => {
        const stack = new Stack(getState())
        dispatch(clearComments())
        dispatch(loadComments(stack.get('uuid')))
    }
}


/******
 * CHAT
 ******/

function postComment(stack_id, message) {
    return {
        type: ActionTypes.SEND_COMMENT,
        message,
        [API_CALL]: {
            method: 'POST',
            endpoint: `stacks/${stack_id}/comments`,
            body: { message },
            authenticated: true
        },
        [GA]: {
            type: GATypes.EVENT,
            category: 'chat',
            action: 'send',
            label: stack_id
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
        if (!message || message.trim().length === 0) {
            return null;
        }

        return dispatch(postComment(id, message));
    }
}

function onCommentsMetadataSuccess(store, next, action, response) {
    store.dispatch({
        type: ActionTypes.ENTITY_UPDATE,
        response: normalize(response.banned_users, Schemas.USERS)
    })
}


function fetchCommentsMetadata(stack_uuid) {
    return {
        type: ActionTypes.COMMENTS_METADATA,
        [API_CALL]: {
            endpoint: `stacks/${stack_uuid}/comments/meta`,
            onSuccessImmediate: onCommentsMetadataSuccess
        }
    }
}

export function loadCommentsMetadata(stack_uuid) {
    return (dispatch, getState) => {
        const stack = new Stack(getState())
        if (!stack.currentUserIsAuthor()) {
            return null;
        }
        dispatch(fetchCommentsMetadata(stack_uuid))
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
    const stack = new Stack(store.getState())
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
    const stack = new Stack(store.getState())
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

export function bookmark() {
    return (dispatch, getState) => {

        const stack = new Stack(getState())
        const id = stack.get('id')
        const status = stack.status()
        if (!id || stack.isBookmarked() || stack.currentUserIsAuthor()) {
            return null;
        }

        return dispatch(postBookmark(id, status));
    }
}

export function unbookmark() {
    return (dispatch, getState) => {

        const stack = new Stack(getState())
        const id = stack.get('id')
        const status = stack.status()
        if (!id || !stack.isBookmarked() || stack.currentUserIsAuthor()) {
            return null;
        }
        
        return dispatch(postUnbookmark(id, status));
    }
}


/**********************
 * MEDIA ITEM SELECTION
 **********************/

function performSelectMediaItem(id) {
    return {
        type: ActionTypes.SELECT_MEDIA_ITEM,
        id 
    }
}

export function selectMediaItem(id) {
    // We store the last selected media item from each stack
    // in the session in localStorage, so that it persists
    // through multiple sessions
    return (dispatch, getState) => {
        const stack = new Stack(getState())
        setStorageItem(stack.get('hid'), id)

        var index = stack.indexOfMediaItem(id)
        browserHistory.push(`/r/${stack.get('hid')}/${index+1}`)

        return dispatch(performSelectMediaItem(id))
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
 * VIEWS
 *******/

export function recordView(stack_id) {
    return {
        type: ActionTypes.RECORD_VIEW,
        [API_CALL]: {
            method: 'PUT',
            endpoint: `stacks/views/${stack_id}`,
            clientOnly: true
        }
    }
}

/*******
 * RESET
 *******/

export function clearRoom() {
    return {
        type: ActionTypes.CLEAR_ROOM,
        [API_CANCEL]: {
            actionTypes: [ActionTypes.COMMENTS, ActionTypes.MEDIA_ITEMS, ActionTypes.ROOM]
        }
    }
}

