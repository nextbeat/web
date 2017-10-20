import { GenericAction, ActionType } from './types'

export type EddyActionAll =
    ConnectEddyAction |
    ReconnectEddyAction |
    DisconnectEddyAction |
    IdentifyEddyAction |
    UnidentifyEddyAction |
    JoinRoomAction |
    LeaveRoomAction |
    StartRoomTimerAction |
    ReceiveCommentAction |
    ReceivePinnedCommentAction |
    ReceiveUnpinnedCommentAction |
    ReceiveMediaItemAction |
    ReceiveNotificationCommentAction |
    ReceiveRoomClosedAction |
    ReceiveBookmarkUpdateAction |
    ReceiveActivityEventAction |
    ReceiveRoomMarkedAction

interface ConnectEddyAction extends GenericAction {
    type: ActionType.CONNECT_EDDY
}
export function connectEddy(): ConnectEddyAction {
    return {
        type: ActionType.CONNECT_EDDY
    }
}

interface ReconnectEddyAction extends GenericAction {
    type: ActionType.RECONNECT_EDDY
}
export function reconnectEddy(): ReconnectEddyAction  {
    return {
        type: ActionType.RECONNECT_EDDY
    }
}

interface DisconnectEddyAction extends GenericAction {
    type: ActionType.DISCONNECT_EDDY
}
export function disconnectEddy(): DisconnectEddyAction {
    return {
        type: ActionType.DISCONNECT_EDDY
    }
}

interface IdentifyEddyAction extends GenericAction {
    type: ActionType.IDENTIFY_EDDY
    token: string
}
export function identifyEddy(token: string): IdentifyEddyAction {
    return {
        type: ActionType.IDENTIFY_EDDY,
        token
    }
}

interface UnidentifyEddyAction extends GenericAction {
    type: ActionType.UNIDENTIFY_EDDY
}
export function unidentifyEddy(): UnidentifyEddyAction {
    return {
        type: ActionType.UNIDENTIFY_EDDY
    }
}

interface JoinRoomAction extends GenericAction {
    type: ActionType.JOIN_ROOM
    roomId: number
}
export function joinRoom(roomId: number): JoinRoomAction {
    return {
        type: ActionType.JOIN_ROOM,
        roomId
    }
}

interface LeaveRoomAction extends GenericAction {
    type: ActionType.LEAVE_ROOM
    roomId: number
}
export function leaveRoom(roomId: number) {
    return {
        type: ActionType.LEAVE_ROOM,
        roomId
    }
}

interface StartRoomTimerAction extends GenericAction {
    type: ActionType.START_ROOM_TIMER
    roomId: number
    timerId: number
}
export function startRoomTimer(roomId: number, timerId: number): StartRoomTimerAction {
    return {
        type: ActionType.START_ROOM_TIMER,
        roomId,
        timerId
    }
}


/*******************
 * RESPONSE HANDLERS
 *******************/

interface ReceiveCommentAction extends GenericAction {
    type: ActionType.RECEIVE_COMMENT
    roomId: number
    comment: object
}
export function receiveComment(roomId: number, comment: object): ReceiveCommentAction {
    return {
        type: ActionType.RECEIVE_COMMENT,
        roomId,
        comment
    }
}

interface ReceivePinnedCommentAction extends GenericAction {
    type: ActionType.RECEIVE_PINNED_COMMENT
    roomId: number
    comment: object
}
export function receivePinnedComment(roomId: number, comment: object): ReceivePinnedCommentAction {
    return {
        type: ActionType.RECEIVE_PINNED_COMMENT,
        roomId,
        comment
    }
}

interface ReceiveUnpinnedCommentAction extends GenericAction {
    type: ActionType.RECEIVE_UNPINNED_COMMENT
    roomId: number
}
export function receiveUnpinnedComment(roomId: number): ReceiveUnpinnedCommentAction {
    return {
        type: ActionType.RECEIVE_UNPINNED_COMMENT,
        roomId
    }
}

interface ReceiveMediaItemAction extends GenericAction {
    type: ActionType.RECEIVE_MEDIA_ITEM
    roomId: number
    mediaItem: object
}
export function receiveMediaItem(roomId: number, mediaItem: object): ReceiveMediaItemAction {
    return {
        type: ActionType.RECEIVE_MEDIA_ITEM,
        roomId,
        mediaItem
    }
}

interface ReceiveNotificationCommentAction extends GenericAction {
    type: ActionType.RECEIVE_NOTIFICATION_COMMENT
    roomId: number
    comment: object
}
export function receiveNotificationComment(roomId: number, comment: object): ReceiveNotificationCommentAction {
    return {
        type: ActionType.RECEIVE_NOTIFICATION_COMMENT,
        roomId,
        comment
    }
}

interface ReceiveRoomClosedAction extends GenericAction {
    type: ActionType.RECEIVE_ROOM_CLOSED
    roomId: number
}
export function receiveRoomClosed(roomId: number): ReceiveRoomClosedAction {
    return {
        type: ActionType.RECEIVE_ROOM_CLOSED,
        roomId
    }
}

interface ReceiveBookmarkUpdateAction extends GenericAction {
    type: ActionType.RECEIVE_BOOKMARK_UPDATE
    roomId: number
    count: number
}
export function receiveBookmarkUpdate(roomId: number, count: number): ReceiveBookmarkUpdateAction {
    return {
        type: ActionType.RECEIVE_BOOKMARK_UPDATE,
        roomId,
        count
    }
}

interface ReceiveActivityEventAction extends GenericAction {
    type: ActionType.RECEIVE_ACTIVITY_EVENT
}
export function receiveActivityEvent(): ReceiveActivityEventAction {
    return {
        type: ActionType.RECEIVE_ACTIVITY_EVENT
    }
}

interface ReceiveRoomMarkedAction extends GenericAction {
    type: ActionType.RECEIVE_ROOM_MARKED
    roomId: number
    unreadCount: number
}
export function receiveRoomMarked(roomId: number, unreadCount: number) {
    return {
        type: ActionType.RECEIVE_ROOM_MARKED,
        roomId,
        unreadCount
    }
}