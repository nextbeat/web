import { GenericAction, ActionType, Status } from '@actions/types'
import EddyClient from '@eddy'

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
    ReceiveMediaItemUpdateAction |
    ReceiveMediaItemDeleteAction |
    ReceiveNotificationCommentAction |
    ReceiveRoomClosedAction |
    ReceiveBookmarkUpdateAction |
    ReceiveActivityEventAction |
    ReceiveRoomMarkedAction

export interface ConnectEddyAction extends GenericAction {
    type: ActionType.CONNECT_EDDY
    status?: Status
    client?: EddyClient
}
export function connectEddy(): ConnectEddyAction {
    return {
        type: ActionType.CONNECT_EDDY
    }
}

export interface ReconnectEddyAction extends GenericAction {
    type: ActionType.RECONNECT_EDDY
}
export function reconnectEddy(): ReconnectEddyAction  {
    return {
        type: ActionType.RECONNECT_EDDY
    }
}

export interface DisconnectEddyAction extends GenericAction {
    type: ActionType.DISCONNECT_EDDY
}
export function disconnectEddy(): DisconnectEddyAction {
    return {
        type: ActionType.DISCONNECT_EDDY
    }
}

export interface IdentifyEddyAction extends GenericAction {
    type: ActionType.IDENTIFY_EDDY
    token: string
}
export function identifyEddy(token: string): IdentifyEddyAction {
    return {
        type: ActionType.IDENTIFY_EDDY,
        token
    }
}

export interface UnidentifyEddyAction extends GenericAction {
    type: ActionType.UNIDENTIFY_EDDY
}
export function unidentifyEddy(): UnidentifyEddyAction {
    return {
        type: ActionType.UNIDENTIFY_EDDY
    }
}

export interface JoinRoomAction extends GenericAction {
    type: ActionType.JOIN_ROOM
    roomId: number
}
export function joinRoom(roomId: number): JoinRoomAction {
    return {
        type: ActionType.JOIN_ROOM,
        roomId
    }
}

export interface LeaveRoomAction extends GenericAction {
    type: ActionType.LEAVE_ROOM
    roomId: number
}
export function leaveRoom(roomId: number) {
    return {
        type: ActionType.LEAVE_ROOM,
        roomId
    }
}

export interface StartRoomTimerAction extends GenericAction {
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

export interface ReceiveCommentAction extends GenericAction {
    type: ActionType.RECEIVE_COMMENT
    roomId: number
    comment: any
}
export function receiveComment(roomId: number, comment: any): ReceiveCommentAction {
    return {
        type: ActionType.RECEIVE_COMMENT,
        roomId,
        comment
    }
}

export interface ReceivePinnedCommentAction extends GenericAction {
    type: ActionType.RECEIVE_PINNED_COMMENT
    roomId: number
    comment: any
}
export function receivePinnedComment(roomId: number, comment: any): ReceivePinnedCommentAction {
    return {
        type: ActionType.RECEIVE_PINNED_COMMENT,
        roomId,
        comment
    }
}

export interface ReceiveUnpinnedCommentAction extends GenericAction {
    type: ActionType.RECEIVE_UNPINNED_COMMENT
    roomId: number
}
export function receiveUnpinnedComment(roomId: number): ReceiveUnpinnedCommentAction {
    return {
        type: ActionType.RECEIVE_UNPINNED_COMMENT,
        roomId
    }
}

export interface ReceiveMediaItemAction extends GenericAction {
    type: ActionType.RECEIVE_MEDIA_ITEM
    roomId: number
    mediaItem: any
}
export function receiveMediaItem(roomId: number, mediaItem: any): ReceiveMediaItemAction {
    return {
        type: ActionType.RECEIVE_MEDIA_ITEM,
        roomId,
        mediaItem
    }
}

export interface ReceiveMediaItemUpdateAction extends GenericAction {
    type: ActionType.RECEIVE_MEDIA_ITEM_UPDATE,
    roomId: number
    mediaItem: any
}
export function receiveMediaItemUpdate(roomId: number, mediaItem: any): ReceiveMediaItemUpdateAction {
    return {
        type: ActionType.RECEIVE_MEDIA_ITEM_UPDATE,
        roomId,
        mediaItem
    }
}

export interface ReceiveMediaItemDeleteAction extends GenericAction {
    type: ActionType.RECEIVE_MEDIA_ITEM_DELETE,
    roomId: number,
    mediaItemId: number
}
export function receiveMediaItemDelete(roomId: number, mediaItemId: number): ReceiveMediaItemDeleteAction {
    return {
        type: ActionType.RECEIVE_MEDIA_ITEM_DELETE,
        roomId,
        mediaItemId
    }
}

export interface ReceiveNotificationCommentAction extends GenericAction {
    type: ActionType.RECEIVE_NOTIFICATION_COMMENT
    roomId: number
    comment: any
}
export function receiveNotificationComment(roomId: number, comment: any): ReceiveNotificationCommentAction {
    return {
        type: ActionType.RECEIVE_NOTIFICATION_COMMENT,
        roomId,
        comment
    }
}

export interface ReceiveRoomClosedAction extends GenericAction {
    type: ActionType.RECEIVE_ROOM_CLOSED
    roomId: number
}
export function receiveRoomClosed(roomId: number): ReceiveRoomClosedAction {
    return {
        type: ActionType.RECEIVE_ROOM_CLOSED,
        roomId
    }
}

export interface ReceiveBookmarkUpdateAction extends GenericAction {
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

export interface ReceiveActivityEventAction extends GenericAction {
    type: ActionType.RECEIVE_ACTIVITY_EVENT
}
export function receiveActivityEvent(): ReceiveActivityEventAction {
    return {
        type: ActionType.RECEIVE_ACTIVITY_EVENT
    }
}

export interface ReceiveRoomMarkedAction extends GenericAction {
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