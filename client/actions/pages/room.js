import { List } from 'immutable'
import { normalize } from 'normalizr'

import ActionTypes from '../types'
import Schemas from '../../schemas'
import { markStackAsRead } from '../notifications'
import { promptModal } from '../app'
import { loadRoom, loadComments, clearComments, clearRoom } from '../room'
import { RoomPage } from '../../models'
import { API_CALL, API_CANCEL, GA, AnalyticsTypes, GATypes } from '../types'


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
    const newRoom = {
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
    return (dispatch, getState) => {
        let message = (new RoomPage(getState())).get('chatMessage', '')
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

function performBanUser(roomId, username) {
    return {
        type: ActionTypes.BAN_USER,
        roomId,
        username
    }
}

export function banUser(username) {
    return (dispatch, getState) => {
        const room = new RoomPage(getState())
        if (!room.currentUserIsAuthor()) {
            return null;
        }
        if (room.userIsBanned(username)) {
            return null;
        }
        dispatch(performBanUser(room.get('id'), username))
    }
}

function performUnbanUser(roomId, username) {
    return {
        type: ActionTypes.UNBAN_USER,
        roomId,
        username
    }
}

export function unbanUser(username) {
    return (dispatch, getState) => {
        const room = new RoomPage(getState())
        if (!room.currentUserIsAuthor()) {
            return null;
        }
        if (!room.userIsBanned(username)) {
            return null;
        }
        dispatch(performUnbanUser(room.get('id'), username))
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
            actionTypes: [ActionTypes.MORE_STACKS]
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
