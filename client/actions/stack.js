import { List } from 'immutable'
import { normalize } from 'normalizr'

import ActionTypes from './types'
import Schemas from '../schemas'
import { markStackAsRead } from './user'
import { loadPaginatedObjects } from './utils'
import { Stack } from '../models'
import { API_CALL, API_CANCEL } from './types'


/**********
 * FETCHING
 **********/

function onStackSuccess(store, next, action, response) {
    const stack = response.entities.stacks[response.result];
    store.dispatch(loadMediaItems(stack.uuid));
    store.dispatch(loadComments(stack.uuid));
    store.dispatch(loadMoreStacks(stack.id));
    store.dispatch(markStackAsRead(stack.id));
    store.dispatch(recordView(stack.id));
}

function fetchStack(hid) {
    return {
        type: ActionTypes.STACK,
        [API_CALL]: {
            schema: Schemas.STACK,
            endpoint: `stacks/${hid}`,
            queries: { 'idAttribute': 'hid' },
            onSuccess: onStackSuccess
        }
    }
}

export function loadStack(hid) {
    return fetchStack(hid)
}

function fetchMoreStacks(stack_id) {
    return {
        type: ActionTypes.MORE_STACKS,
        stack_id,
        [API_CALL]: {
            schema: Schemas.STACKS,
            endpoint: `stacks/${stack_id}/more`,
            pagination: { limit: 6, page: 1 }
        }
    }
}

export function loadMoreStacks(stack_id, tags) {
    return fetchMoreStacks(stack_id, tags)
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


/******************
 * SENDING COMMENTS
 ******************/

function postComment(stack_id, message) {
    return {
        type: ActionTypes.SEND_COMMENT,
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
        if (!message || message.trim().length === 0) {
            return null;
        }

        return dispatch(postComment(id, message));
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

export function selectMediaItem(id) {
    return {
        type: ActionTypes.SELECT_MEDIA_ITEM,
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

export function clearStack() {
    return {
        type: ActionTypes.CLEAR_STACK,
        [API_CANCEL]: {
            actionTypes: [ActionTypes.COMMENTS, ActionTypes.MEDIA_ITEMS, ActionTypes.MORE_STACK, ActionTypes.STACK]
        }
    }
}

