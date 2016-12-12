import { List } from 'immutable'
import { normalize } from 'normalizr'

import ActionTypes from '../types'
import Schemas from '../../schemas'
import { markStackAsRead } from '../notifications'
import { promptModal } from '../app'
import { loadPaginatedObjects } from '../utils'
import { loadRoom } from '../room'
import { Stack } from '../../models'
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

function loadRoomPage(hid) {
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

export function clearRoomPage() {
    return {
        type: ActionTypes.CLEAR_ROOM_PAGE,
        [API_CANCEL]: {
            actionTypes: [ActionTypes.MORE_STACKS]
        }
    }
}
