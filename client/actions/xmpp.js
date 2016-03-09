import ActionTypes from './types'

export function connectToXMPP() {
    return {
        type: ActionTypes.CONNECT_XMPP
    }
}

export function disconnectXMPP() {
    return {
        type: ActionTypes.DISCONNECT_XMPP
    }
}

export function joinRoom() {
    return {
        type: ActionTypes.JOIN_ROOM
    }
}

export function leaveRoom() {
    return {
        type: ActionTypes.LEAVE_ROOM
    }
}

export function receiveComment(message, username) {
    return {
        type: ActionTypes.RECEIVE_COMMENT,
        message,
        username
    }
}

export function receiveNotificationComment(data, username) {
    return {
        type: ActionTypes.RECEIVE_NOTIFICATION_COMMENT,
        data,
        username
    }
}   

export function receiveMediaItem(id, response) {
    return {
        type: ActionTypes.RECEIVE_MEDIA_ITEM,
        id,
        response
    }
}

export function receiveStackClosed() {
    return {
        type: ActionTypes.RECEIVE_STACK_CLOSED
    }
}