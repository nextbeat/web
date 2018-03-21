import assign from 'lodash-es/assign'
import { normalize } from 'normalizr'
import * as format from 'date-fns/format'
import * as Promise from 'bluebird'

import { EddyError } from '@errors'
import { Store, Dispatch } from '@types'
import { Status, Action, GenericAction, ActionType } from '@actions/types' 
import { 
    joinRoom, 
    leaveRoom, 
    reconnectEddy, 
    startRoomTimer 
} from '@actions/eddy'
import { 
    ConnectEddyAction, 
    ReconnectEddyAction, 
    DisconnectEddyAction,
    IdentifyEddyAction,
    UnidentifyEddyAction,
    JoinRoomAction,
    LeaveRoomAction,
    ReceiveCommentAction,
    ReceivePinnedCommentAction,
    ReceiveMediaItemAction,
    ReceiveMediaItemUpdateAction,
    ReceiveNotificationCommentAction,
    ReceiveRoomClosedAction,
    ReceiveBookmarkUpdateAction
} from '@actions/eddy'
import { 
    getRoomInfo,
    slashCommandResponse 
} from '@actions/room'
import {
    RoomInfoAction,
    SendCommentAction,
    PinCommentAction,
    UnpinCommentAction,
    BookmarkAction,
    UnbookmarkAction,
    RoomBanAction,
    RoomUnbanAction,
    RoomAction,
    ClearRoomAction
} from '@actions/room'
import {
    CreatorBanAction,
    CreatorUnbanAction,
    ModAction,
    UnmodAction
} from '@actions/user'
import { triggerAuthError } from '@actions/app'

import Eddy from '@models/state/eddy'
import Room from '@models/state/room'
import CurrentUser from '@models/state/currentUser'
import EddyClient from '@eddy'
import * as Schemas from '@schemas'

interface WrapOptions {
    updateAction?: UpdateActionCallback
    successCallback?: SuccessCallback
}

interface UpdateActionCallback {
    (action: GenericAction): GenericAction
}

interface SuccessCallback {
    (action: GenericAction, client: EddyClient, data: any): void
}

interface WrapFn {
    (action: GenericAction, client: EddyClient): Promise<object>
}

interface Wrap {
    (fn: WrapFn, options?: WrapOptions): void
}

function messageForError(error: EddyError): string {
    switch (error.message) {
        case "not_permitted":
            return "This action is not permitted.";
        case "already_banned":
            return "This user is already banned.";
        case "not_banned":
            return "This user is not banned.";
        case "already_moderator":
            return "This user is already a moderator.";
        case "not_moderator":
            return "This user is not a moderator.";
        default:
            return "Unknown error.";
    }
}

function wrapAction(store: Store, next: Dispatch, action: Action): Wrap {
    let client = Eddy.client(store.getState())

    function actionWith(status: Status, data?: {[key: string]: any}): GenericAction {
        return assign({}, action, { status }, data)
    }

    return (fn, options) => {

        if (!client) {
            let error = new Error("Attempted to send message before establishing client.")
            return next(actionWith(Status.FAILURE, { error }))
        }

        next(actionWith(Status.REQUESTING));

        fn(action, client)
            .then((responseData) => { 
                let successAction = actionWith(Status.SUCCESS, { responseData })
                if (options && typeof options.updateAction === "function") {
                    successAction = options.updateAction(successAction)
                }
                next(successAction)

                if (options && typeof options.successCallback === "function") {
                    options.successCallback(successAction, client, responseData)
                }
            })
            .catch((error) => { 
                if (error instanceof EddyError && action.roomId && action.type !== ActionType.SEND_COMMENT) {
                    const message = messageForError(error)
                    store.dispatch(slashCommandResponse(action.roomId, message))
                }
                next(actionWith(Status.FAILURE, { error }));
            })
    }
}

function _roomInfoUpdateAction(action: GenericAction) {
    // Separate function since used both in roomJoin and roomInfo
    if ('id' in action.responseData.pinned_chat) {
        // normalize pinned comment
        let pinnedComment = assign({}, action.responseData.pinned_chat, {
            type: "message"
        })
        const response = normalize(pinnedComment, Schemas.Comment)
        return assign({}, action, { response })
    }
    return action
}

function connect(store: Store, next: Dispatch, action: ConnectEddyAction) {
    let client = new EddyClient(store);
    
    next(assign({}, action, { status: Status.REQUESTING, client }))

    client.connect()
    .then(() => {
        next(assign({}, action, { status: Status.SUCCESS }))
    })
    .catch(() => {
        // Start attempting to reconnect
        store.dispatch(reconnectEddy());
        next(assign({}, action, { status: Status.FAILURE }))
    })
}

function reconnect(store: Store, next: Dispatch, action: ReconnectEddyAction) {
    const client = Eddy.client(store.getState());

    next(assign({}, action, { status: Status.REQUESTING }))

    client.reconnect()
    .then(() => {
        next(assign({}, action, { status: Status.SUCCESS }))
    })
    .catch(() => {
        next(assign({}, action, { status: Status.FAILURE }))
    })
}

function disconnect(store: Store, next: Dispatch, action: DisconnectEddyAction) {
    const client = Eddy.client(store.getState());
    client.disconnect();
    next(action);
}

function identify(action: IdentifyEddyAction, client: EddyClient) {
    return client.identify(action.token);
}

function wrapIdentify(store: Store, next: Dispatch, action: IdentifyEddyAction) {
    let successCallback: SuccessCallback = function(action, client, responseData) {
        let rooms = Room.loadedRoomIds(store.getState())
        rooms.forEach(roomId => {
            store.dispatch(getRoomInfo(roomId))
        })
    }
    return wrapAction(store, next, action)(identify, { successCallback })
}

function unidentify(action: UnidentifyEddyAction, client: EddyClient) {
    return client.unidentify();
}

function join(action: JoinRoomAction, client: EddyClient) {
    return client.join(action.roomId);
}

function wrapJoin(store: Store, next: Dispatch, action: JoinRoomAction) {
    let successCallback = function(action: JoinRoomAction, client: EddyClient, responseData: any) {
        // set up room info timer
        let roomInfoIntervalId = window.setInterval(() => {
            store.dispatch(getRoomInfo(action.roomId))
        }, 15000)

        store.dispatch(startRoomTimer(action.roomId, roomInfoIntervalId))
    }
    return wrapAction(store, next, action)(join, { successCallback, updateAction: _roomInfoUpdateAction })
}

function leave(action: LeaveRoomAction, client:EddyClient) {
    return client.leave(action.roomId);
}

function wrapLeave(store: Store, next: Dispatch, action: LeaveRoomAction) {
    let timerId = Room.get(store.getState(), action.roomId, 'timerId')
    if (timerId) {
        clearInterval(timerId)
    }
    return wrapAction(store, next, action)(leave)
}

function roomInfo(action: RoomInfoAction, client: EddyClient) {
    return client.getRoomInfo(action.roomId);
}

function wrapRoomInfo(store: Store, next: Dispatch, action: RoomInfoAction) {
    return wrapAction(store, next, action)(roomInfo, { updateAction: _roomInfoUpdateAction })
}

function bookmark(action: BookmarkAction, client: EddyClient) {
    return client.bookmark(action.roomId);
}

function wrapBookmark(store: Store, next: Dispatch, action: BookmarkAction) {

    let updateAction = function(action: BookmarkAction) {
        const newStack = {
            id: action.roomId,
            bookmark_count: action.responseData.count,
            bookmarked: true
        }
        const response = normalize(newStack, Schemas.Stack)
        return assign({}, action, { response })
    }

    return wrapAction(store, next, action)(bookmark, { updateAction })
}

function unbookmark(action: UnbookmarkAction, client: EddyClient) {
    return client.unbookmark(action.roomId);
}

function wrapUnbookmark(store: Store, next: Dispatch, action: UnbookmarkAction) {

    let updateAction = function(action: UnbookmarkAction,) {
        const newStack = {
            id: action.roomId,
            bookmark_count: action.responseData.count,
            bookmarked: false
        }
        const response = normalize(newStack, Schemas.Stack)
        return assign({}, action, { response })
    }

    return wrapAction(store, next, action)(unbookmark, { updateAction })
}

function sendComment(action: SendCommentAction, client: EddyClient) {
    return client.chat(action.roomId, action.message);
}

function wrapSendComment(store: Store, next: Dispatch, action: SendCommentAction) {

    let updateAction = function(action: SendCommentAction) {
        const comment = assign({}, action.responseData.comment, {
            stack_id: action.roomId,
            type: 'message'
        })
        const response = normalize(comment, Schemas.Comment)
        return assign({}, action, { response })
    }

    return wrapAction(store, next, action)(sendComment, { updateAction })
}

function pinComment(action: PinCommentAction, client: EddyClient) {
    return client.pin(action.roomId, action.message);
}

function wrapPinComment(store: Store, next: Dispatch, action: PinCommentAction) {

    let updateAction = function(action: PinCommentAction) {
        const comment = assign({}, action.responseData.comment, {
            stack_id: action.roomId,
            type: 'message'
        })
        const response = normalize(comment, Schemas.Comment)
        return assign({}, action, { response })
    }

    return wrapAction(store, next, action)(pinComment, { updateAction })
}

function unpinComment(action: UnpinCommentAction, client: EddyClient) {
    return client.unpin(action.roomId);
}

function roomBan(action: RoomBanAction, client: EddyClient) {
    return client.roomBan(action.roomId, action.username);
}

function roomUnban(action: RoomUnbanAction, client: EddyClient) {
    return client.roomUnban(action.roomId, action.username);
}

function creatorBan(action: CreatorBanAction, client: EddyClient) {
    return client.creatorBan(action.creatorId, action.username);
}

function creatorUnban(action: CreatorUnbanAction, client: EddyClient) {
    return client.creatorUnban(action.creatorId, action.username);
}

function mod(action: ModAction, client: EddyClient) {
    return client.mod(action.creatorId, action.username);
}

function unmod(action: ModAction, client: EddyClient) {
    return client.unmod(action.creatorId, action.username);
}

function loadRoom(store: Store, next: Dispatch, action: RoomAction) {
    if (action.status === Status.SUCCESS) {
        store.dispatch(joinRoom(action.roomId));
    }
    return next(action);
}

function clearRoom(store: Store, next: Dispatch, action: ClearRoomAction) {
    store.dispatch(leaveRoom(action.roomId));
    return next(action);
}

function receiveComment(store: Store, next: Dispatch, action: ReceiveCommentAction) {
    // Trigger an entity update
    const response = normalize(action.comment, Schemas.Comment)
    return next(assign({}, action, { response }))
}

function receivePinnedComment(store: Store, next: Dispatch, action: ReceivePinnedCommentAction) {
    // Trigger an entity update
    const response = normalize(action.comment, Schemas.Comment)
    return next(assign({}, action, { response }))
}

function receiveMediaItem(store: Store, next: Dispatch, action: ReceiveMediaItemAction) {
    // Trigger an entity update
    let response = normalize(action.mediaItem, Schemas.MediaItem)
    if (!!action.mediaItem.references) {
        // We need to invalidate the cached selector 
        // so that the new comment will trigger a page refresh
        Room.clearCommentsSelector(store.getState(), action.roomId)
    }

    return next(assign({}, action, { response }))
}

function receiveMediaItemUpdate(store: Store, next: Dispatch, action: ReceiveMediaItemUpdateAction) {
    let response = normalize(action.mediaItem, Schemas.MediaItem)
    Room.clearMediaItemsSelector(store.getState(), action.roomId)
    return next(assign({}, action, { response }))
}

function receiveNotificationComment(store: Store, next: Dispatch, action: ReceiveNotificationCommentAction) {
    // Trigger an entity update
    const response = normalize(action.comment, Schemas.Comment)
    return next(assign({}, action, { response }))   
}

function receiveRoomClosed(store: Store, next: Dispatch, action: ReceiveRoomClosedAction) {
    // Trigger an entity update
    let updatedStack = {
        id: action.roomId,
        closed: true
    }
    const response = normalize(updatedStack, Schemas.Stack)
    return next(assign({}, action, { response }))
}

function receiveBookmarkUpdate(store: Store, next: Dispatch, action: ReceiveBookmarkUpdateAction) {
    const newStack = {
        id: action.roomId,
        bookmark_count: action.count
    }
    const response = normalize(newStack, Schemas.Stack)
    return next(assign({}, action, { response }))
}

export default (store: Store) => (next: Dispatch) => (action: Action) => {
    let wrap = wrapAction(store, next, action)
    switch (action.type) {
        case ActionType.CONNECT_EDDY:
            return connect(store, next, action);
        case ActionType.RECONNECT_EDDY:
            return reconnect(store, next, action);
        case ActionType.DISCONNECT_EDDY:
            return disconnect(store, next, action);
        case ActionType.IDENTIFY_EDDY:
            return wrapIdentify(store, next, action);
        case ActionType.UNIDENTIFY_EDDY:
            return wrap(unidentify);
        case ActionType.JOIN_ROOM:
            return wrapJoin(store, next, action);
        case ActionType.LEAVE_ROOM:
            return wrapLeave(store, next, action);
        case ActionType.ROOM_INFO:
            return wrapRoomInfo(store, next, action);
        case ActionType.SEND_COMMENT:
            return wrapSendComment(store, next, action);
        case ActionType.PIN_COMMENT:
            return wrapPinComment(store, next, action);
        case ActionType.UNPIN_COMMENT:
            return wrap(unpinComment);
        case ActionType.BOOKMARK:
            return wrapBookmark(store, next, action);
        case ActionType.UNBOOKMARK:
            return wrapUnbookmark(store, next, action);
        case ActionType.ROOM_BAN:
            return wrap(roomBan);
        case ActionType.ROOM_UNBAN:
            return wrap(roomUnban);
        case ActionType.CREATOR_BAN:
            return wrap(creatorBan);
        case ActionType.CREATOR_UNBAN:
            return wrap(creatorUnban)
        case ActionType.MOD:
            return wrap(mod)
        case ActionType.UNMOD:
            return wrap(unmod)
        case ActionType.ROOM:
            return loadRoom(store, next, action)
        case ActionType.CLEAR_ROOM:
            return clearRoom(store, next, action)
        case ActionType.RECEIVE_COMMENT:
            return receiveComment(store, next, action)
        case ActionType.RECEIVE_PINNED_COMMENT:
            return receivePinnedComment(store, next, action)
        case ActionType.RECEIVE_MEDIA_ITEM:
            return receiveMediaItem(store, next, action)
        case ActionType.RECEIVE_MEDIA_ITEM_UPDATE:
            return receiveMediaItemUpdate(store, next, action)
        case ActionType.RECEIVE_NOTIFICATION_COMMENT:
            return receiveNotificationComment(store, next, action)
        case ActionType.RECEIVE_ROOM_CLOSED:
            return receiveRoomClosed(store, next, action)
        case ActionType.RECEIVE_BOOKMARK_UPDATE:
            return receiveBookmarkUpdate(store, next, action)
        default:
            return next(action);
    }
}