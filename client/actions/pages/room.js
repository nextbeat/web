import { List } from 'immutable'
import { normalize } from 'normalizr'

import ActionTypes from '../types'
import Schemas from '../../schemas'
import { markStackAsRead } from '../notifications'
import { promptModal } from '../app'
import { loadRoom, loadComments, clearComments, clearRoom } from '../room'
import { RoomPage } from '../../models'
import { API_CALL, API_CANCEL, GA, AnalyticsTypes, GATypes, EntityUpdateStrategy } from '../types'
import { loadPaginatedObjects } from '../utils'


/**********
 * FETCHING
 **********/

function onRoomPageSuccess(store, next, action, response) {
    const stack = response.entities.stacks[response.result];
    store.dispatch(loadRoom(stack.id));
    store.dispatch(loadMoreStacks(stack.id));
    store.dispatch(markStackAsRead(stack.id));
    store.dispatch(recordView(stack.id)); 
}

function fetchRoomPage(hid) {
    return {
        type: ActionTypes.ROOM_PAGE,
        [API_CALL]: {
            schema: Schemas.STACK,
            endpoint: `stacks/${hid}`,
            queries: { idAttribute: 'hid' },
            onSuccess: onRoomPageSuccess
        }
    }
}

export function loadRoomPage(hid) {
    return fetchRoomPage(hid)
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

function doSearchChat(roomId, query, pagination) {
    return {
        type: ActionTypes.SEARCH_CHAT,
        roomId,
        [API_CALL]: {
            schema: Schemas.SEARCH_RESULT_COMMENTS,
            endpoint: `stacks/${roomId}/comments/search`,
            queries: { q: query },
            pagination
        }
    }
}

export function searchChat(query, isNewSearch=true) {
    return (dispatch, getState) => {
        const room = new RoomPage(getState())
        const roomId = room.get('id')
        if (isNewSearch) {
            dispatch(clearSearchChat())
        }
        loadPaginatedObjects(['pages', 'room', 'chat', 'search'], doSearchChat.bind(this, roomId, query), 20)(dispatch, getState)
    }
}

export function clearSearchChat() {
    return {
        type: ActionTypes.CLEAR_SEARCH_CHAT
    }
}

function doHideSearchChatResults() {
    return {
        type: ActionTypes.HIDE_SEARCH_CHAT_RESULTS
    }
}

export function hideSearchChatResults() {
    return (dispatch) => {
        dispatch(clearSearchChat())
        dispatch(doHideSearchChatResults())
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
        const room = new RoomPage(getState())
        const id = room.get('id')
        if (!id || !room.currentUserIsAuthor()) {
            return null;
        }
        return dispatch(postDeleteStack(id))
    }
}

function onCloseStackSuccess(store, next, action, response) {
    const room = new RoomPage(store.getState())
    const newStack = {
        id: room.get('id'),
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

export function closeStack() {
    return (dispatch, getState) => {
        const room = new RoomPage(getState())
        const id = room.get('id')
        if (!id || !room.currentUserIsAuthor()) {
            return null;
        }
        return dispatch(postCloseStack(id))
    }
}

function postDeleteMediaItem(roomId, id) {
    return {
        type: ActionTypes.DELETE_MEDIA_ITEM,
        roomId,
        id,
        [API_CALL]: {
            method: 'DELETE',
            endpoint: `mediaitems/${id}`,
            authenticated: true
        }
    }
}

export function deleteMediaItem(id) {
    return (dispatch, getState) => {
        const room = new RoomPage(getState())
        const roomId = room.get('id')
        if (!roomId || !room.currentUserIsAuthor()) {
            return null;
        }
        return dispatch(postDeleteMediaItem(roomId, id))
    }
}


/******
 * CHAT
 ******/

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
    return {
        type: ActionTypes.MENTION_USER,
        username
    }
}

export function clearChatMessage() {
    return {
        type: ActionTypes.CLEAR_CHAT_MESSAGE
    }
}

export function resetChat() {
    return (dispatch, getState) => {
        const room = new RoomPage(getState())
        dispatch(clearComments(room.get('id')))
        dispatch(loadComments(room.get('id')))
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
 * RESET
 *******/

function performClearRoomPage() {
    return {
        type: ActionTypes.CLEAR_ROOM_PAGE,
        [API_CANCEL]: {
            actionTypes: [ActionTypes.MORE_STACKS, ActionTypes.SEARCH_CHAT]
        }
    }
}

export function clearRoomPage() {
    return (dispatch, getState) => {
        let roomPage = new RoomPage(getState())
        dispatch(clearRoom(roomPage.get('id')))
        dispatch(performClearRoomPage())
    }
}
