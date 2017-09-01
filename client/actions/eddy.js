import ActionTypes from './types'

export function connectEddy() {
    return {
        type: ActionTypes.CONNECT_EDDY
    }
}

export function reconnectEddy() {
    return {
        type: ActionTypes.RECONNECT_EDDY
    }
}

export function disconnectEddy() {
    return {
        type: ActionTypes.DISCONNECT_EDDY
    }
}

export function identifyEddy(token) {
    return {
        type: ActionTypes.IDENTIFY_EDDY,
        token
    }
}

export function unidentifyEddy() {
    return {
        type: ActionTypes.UNIDENTIFY_EDDY
    }
}

export function joinRoom(roomId) {
    return {
        type: ActionTypes.JOIN_ROOM,
        roomId
    }
}

export function leaveRoom(roomId) {
    return {
        type: ActionTypes.LEAVE_ROOM,
        roomId
    }
}

export function startRoomTimer(roomId, timerId) {
    return {
        type: ActionTypes.START_ROOM_TIMER,
        roomId,
        timerId
    }
}


/*******************
 * RESPONSE HANDLERS
 *******************/

export function receiveComment(roomId, comment) {
    return {
        type: ActionTypes.RECEIVE_COMMENT,
        roomId,
        comment
    }
}

export function receivePinnedComment(roomId, comment) {
    return {
        type: ActionTypes.RECEIVE_PINNED_COMMENT,
        roomId,
        comment
    }
}

export function receiveUnpinnedComment(roomId) {
    return {
        type: ActionTypes.RECEIVE_UNPINNED_COMMENT,
        roomId
    }
}

export function receiveMediaItem(roomId, mediaItem) {
    return {
        type: ActionTypes.RECEIVE_MEDIA_ITEM,
        roomId,
        mediaItem
    }
}

export function receiveNotificationComment(roomId, comment) {
    return {
        type: ActionTypes.RECEIVE_NOTIFICATION_COMMENT,
        roomId,
        comment
    }
}

export function receiveRoomClosed(roomId) {
    return {
        type: ActionTypes.RECEIVE_ROOM_CLOSED,
        roomId
    }
}

export function receiveBookmarkUpdate(roomId, count) {
    return {
        type: ActionTypes.RECEIVE_BOOKMARK_UPDATE,
        roomId,
        count
    }
}

export function receiveActivityEvent() {
    return {
        type: ActionTypes.RECEIVE_ACTIVITY_EVENT
    }
}

export function receiveRoomMarked(roomId, unreadCount) {
    return {
        type: ActionTypes.RECEIVE_ROOM_MARKED,
        roomId,
        unreadCount
    }
}