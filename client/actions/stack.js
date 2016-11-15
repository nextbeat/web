import { List } from 'immutable'
import { flatten } from 'lodash'
import { normalize } from 'normalizr'
import { browserHistory } from 'react-router'

import ActionTypes from './types'
import Schemas from '../schemas'
import { markStackAsRead } from './user'
import { promptModal } from './app'
import { pushSubscribe } from './push'
import { loadPaginatedObjects } from './utils'
import { Stack } from '../models'
import { API_CALL, API_CANCEL, ANALYTICS, GA, AnalyticsTypes, GATypes } from './types'
import { setStorageItem } from '../utils'


/**********
 * FETCHING
 **********/

function onStackSuccess(store, next, action, response) {
    const stack = response.entities.stacks[response.result];
    store.dispatch(loadMediaItems(stack.uuid));
    store.dispatch(loadComments(stack.uuid));
    store.dispatch(loadCommentsMetadata(stack.uuid))
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

function promptChatActions(username) {
    return {
        type: ActionTypes.PROMPT_CHAT_ACTIONS,
        username
    }
}

export function promptChatActionsForUser(username) {
    return (dispatch, getState) => {
        dispatch(promptChatActions(username))
        dispatch(promptModal('chat-user-actions'))
    }
}

export function mentionUser(username) {
    return (dispatch, getState) => {
        let message = (new Stack(getState())).get('chatMessage', '')
        if (message.length === 0 || /\s$/.test(message)) {
            // don't add whitespace
            message = `${message}@${username}`
        } else {
            message = `${message} @${username}`
        }
        
        dispatch(updateChatMessage(message))
    }
}

export function updateChatMessage(message) {
    return {
        type: ActionTypes.UPDATE_CHAT_MESSAGE,
        message
    }
}

function postBanUser(stack_id, username) {
    return {
        type: ActionTypes.BAN_USER,
        [API_CALL]: {
            method: 'POST',
            schema: Schemas.USER,
            endpoint: `stacks/${stack_id}/comments/${username}/ban`,
            authenticated: true
        }
    }
}

export function banUser(username) {
    return (dispatch, getState) => {
        const stack = new Stack(getState())
        if (!stack.currentUserIsAuthor()) {
            return null;
        }
        if (stack.userIsBanned(username)) {
            return null;
        }
        dispatch(postBanUser(stack.get('id'), username))
    }
}

function postUnbanUser(stack_id, username) {
    return {
        type: ActionTypes.UNBAN_USER,
        [API_CALL]: {
            method: 'POST',
            schema: Schemas.USER,
            endpoint: `stacks/${stack_id}/comments/${username}/unban`,
            authenticated: true
        }
    }
}

export function unbanUser(username) {
    return (dispatch, getState) => {
        const stack = new Stack(getState())
        if (!stack.currentUserIsAuthor()) {
            return null;
        }
        if (!stack.userIsBanned(username)) {
            return null;
        }
        dispatch(postUnbanUser(stack.get('id'), username))
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


/**************
 * CRUD ACTIONS
 **************/

function postDeleteStack(id) {
    return {
        type: ActionTypes.DELETE_STACK,
        [API_CALL]: {
            method: 'DELETE',
            endpoint: `stacks/${id}`,
            authenticated: true
        }
    }
}

export function deleteStack() {
    return (dispatch, getState) => {
        const stack = new Stack(getState())
        const id = stack.get('id')
        if (!id || !stack.currentUserIsAuthor()) {
            return null;
        }
        return dispatch(postDeleteStack(id))
    }
}

function onCloseStackSuccess(store, next, action, response) {
    const stack = new Stack(store.getState())
    const newStack = {
        id: stack.get('id'),
        closed: true
    }
    store.dispatch({
        type: ActionTypes.ENTITY_UPDATE,
        response: normalize(newStack, Schemas.STACK)
    })
}

function postCloseStack(id) {
    return {
        type: ActionTypes.CLOSE_STACK,
        [API_CALL]: {
            method: 'POST',
            endpoint: `stacks/${id}/close`,
            authenticated: true,
            onSuccess: onCloseStackSuccess
        }
    }
}

export function closeStack(id) {
    return (dispatch, getState) => {
        const stack = new Stack(getState())
        const id = stack.get('id')
        if (!id || !stack.currentUserIsAuthor()) {
            return null;
        }
        return dispatch(postCloseStack(id))
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

/**************
 * UI SELECTION
 **************/

export function selectDetailSection(section) {
    return {
        type: ActionTypes.SELECT_DETAIL_SECTION,
        section
    }
}

export function closeDetailSection() {
    return {
        type: ActionTypes.CLOSE_DETAIL_SECTION
    }
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

