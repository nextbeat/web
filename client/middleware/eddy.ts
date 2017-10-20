import assign from 'lodash-es/assign'
import { normalize } from 'normalizr'
import * as format from 'date-fns/format'
import * as Promise from 'bluebird'

// import EddyClient from '../eddy'
// import { ActionTypes, Status } from '../actions'
// import { joinRoom, leaveRoom, reconnectEddy, getRoomInfo, startRoomTimer, triggerAuthError } from '../actions'
// import { Eddy, CurrentUser, Room } from '../models'
// import Schemas from '../schemas'

import { Store, Dispatch } from '@types'
import { Status, Action, GenericAction, ActionType } from '@actions/types' 

interface WrapOptions {
    successCallback?: WrapCallback
    failureCallback?: WrapCallback
}

interface WrapCallback {
    (action: GenericAction, client: any, data: any): void
}

interface WrapFn {
    (action: GenericAction, client: any): Promise<object>
}

interface Wrap {
    (fn: WrapFn, options: WrapOptions): void
}

function wrapAction(store: Store, next: Dispatch, action: Action): Wrap {
    let eddy = new Eddy(store.getState());
    let client = eddy.get('client');

    function actionWith (status: Status, data?: {[key: string]: any}): GenericAction {
        return assign({}, action, { status }, data)
    }

    return (fn, { successCallback, failureCallback } = {}) => {

        if (!client) {
            let error = new Error("Attempted to send message before establishing client.")
            return next(actionWith(Status.FAILURE, { error }))
        }

        next(actionWith(Status.REQUESTING));

        fn(action, client)
            .then((responseData) => { 
                next(actionWith(Status.SUCCESS, { responseData }));
                if (typeof successCallback === "function") {
                    successCallback(action, client, responseData);
                }
            })
            .catch((error) => { 
                next(actionWith(Status.FAILURE, { error }));
                if (typeof failureCallback === "function") {
                    failureCallback(action, client, error);
                }
            })
    }
}

function _roomInfoSuccessCallback(store, next, action) {
    // Separate function since used both in roomJoin and roomInfo
    return (action, client, responseData) => {
        if ('id' in responseData.pinned_chat) {
            // normalize pinned comment
            let pinnedComment = assign({}, responseData.pinned_chat, {
                type: "message"
            })
            const response = normalize(pinnedComment, Schemas.COMMENT)
            store.dispatch({
                type: ActionTypes.ENTITY_UPDATE,
                response
            })
        }
    }
}

function connect(store, next, action) {
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

function reconnect(store, next, action) {
    let eddy = new Eddy(store.getState());

    next(assign({}, action, { status: Status.REQUESTING }))

    eddy.client.reconnect()
    .then(() => {
        next(assign({}, action, { status: Status.SUCCESS }))
    })
    .catch(() => {
        next(assign({}, action, { status: Status.FAILURE }))
    })
}

function disconnect(store, next, action) {
    let eddy = new Eddy(store.getState());
    eddy.client.disconnect();
    next(action);
}

function identify(action, client) {
    return client.identify(action.token);
}

function wrapIdentify(store, next, action) {
    let successCallback = function(action, client, responseData) {
        let rooms = Room.loadedRooms(store.getState())
        rooms.forEach(room => {
            store.dispatch(getRoomInfo(room.id))
        })
    }
    return _wrapAction(store, next, action)(identify, { successCallback })
}

function unidentify(action, client) {
    return client.unidentify();
}

function join(action, client) {
    return client.join(action.roomId);
}

function wrapJoin(store, next, action) {
    let successCallback = function(action, client, responseData) {
        // call room info success callback
        _roomInfoSuccessCallback(store, next, action)(action, client, responseData)

        // set up room info timer
        let roomInfoIntervalId = setInterval(() => {
            store.dispatch(getRoomInfo(action.roomId))
        }, 15000)

        store.dispatch(startRoomTimer(action.roomId, roomInfoIntervalId))
    }
    return _wrapAction(store, next, action)(join, { successCallback })
}

function leave(action, client) {
    return client.leave(action.roomId);
}

function wrapLeave(store, next, action) {
    let room = new Room(action.roomId, store.getState())
    let timerId = room.get('timerId')
    if (timerId) {
        clearInterval(timerId)
    }

    return _wrapAction(store, next, action)(leave)
}

function roomInfo(action, client) {
    return client.getRoomInfo(action.roomId);
}

function wrapRoomInfo(store, next, action) {
    let successCallback = _roomInfoSuccessCallback(store, next, action)
    return _wrapAction(store, next, action)(roomInfo, { successCallback })
}

function bookmark(action, client) {
    return client.bookmark(action.roomId);
}

function wrapBookmark(store, next, action) {

    let successCallback = function(action, client, responseData) {
        const newStack = {
            id: action.roomId,
            bookmark_count: responseData.count,
            bookmarked: true
        }
        const response = normalize(newStack, Schemas.STACK)
        store.dispatch({
            type: ActionTypes.ENTITY_UPDATE,
            response
        })
    }

    return _wrapAction(store, next, action)(bookmark, { successCallback })
}

function unbookmark(action, client) {
    return client.unbookmark(action.roomId);
}

function wrapUnbookmark(store, next, action) {

    let successCallback = function(action, client, responseData) {
        const newStack = {
            id: action.roomId,
            bookmark_count: responseData.count,
            bookmarked: false
        }
        const response = normalize(newStack, Schemas.STACK)
        store.dispatch({
            type: ActionTypes.ENTITY_UPDATE,
            response
        })
    }

    return _wrapAction(store, next, action)(unbookmark, { successCallback })
}

function ban(action, client) {
    return client.ban(action.roomId, action.username);
}

function unban(action, client) {
    return client.unban(action.roomId, action.username);
}

function sendComment(action, client) {
    return client.chat(action.roomId, action.message);
}

function wrapSendComment(store, next, action) {

    let successCallback = function(action, client, responseData) {
        // save comment into entities, now that we have the id
        // todo: private comment support
        const currentUser = new CurrentUser(store.getState())
        const comment = {
            message: action.message,
            type: "message",
            subtype: "public",
            id: responseData.comment_id,
            user_mentions: responseData.user_mentions,
            stack_id: action.roomId,
            created_at: format(new Date()),
            author: {
                id: currentUser.get('id')
            }
        }
        const response = normalize(comment, Schemas.COMMENT)
        store.dispatch({
            type: ActionTypes.ENTITY_UPDATE,
            response
        })
    }

    return _wrapAction(store, next, action)(sendComment, { successCallback })
}

function pinComment(action, client) {
    return client.pin(action.roomId, action.message);
}

function wrapPinComment(store, next, action) {

    let successCallback = function(action, client, responseData) {
        const currentUser = new CurrentUser(store.getState())
        const comment = {
            message: action.message,
            type: "message",
            subtype: "pinned",
            id: responseData.comment_id,
            stack_id: action.roomId,
            user_mentions: responseData.user_mentions,
            author: {
                id: currentUser.get('id')
            }
        }
        const response = normalize(comment, Schemas.COMMENT)
        store.dispatch({
            type: ActionTypes.ENTITY_UPDATE,
            response
        })
    }

    return _wrapAction(store, next, action)(pinComment, { successCallback })
}

function unpinComment(action, client) {
    return client.unpin(action.roomId);
}

function loadRoom(store, next, action) {
    if (action.status === Status.SUCCESS) {
        store.dispatch(joinRoom(action.roomId));
    }
    return next(action);
}

function clearRoom(store, next, action) {
    store.dispatch(leaveRoom(action.roomId));
    return next(action);
}

function receiveComment(store, next, action) {
    // Trigger an entity update
    const response = normalize(action.comment, Schemas.COMMENT)
    return next(assign({}, action, { response }))
}

function receivePinnedComment(store, next, action) {
    // Trigger an entity update
    const response = normalize(action.comment, Schemas.COMMENT)
    return next(assign({}, action, { response }))
}

function receiveMediaItem(store, next, action) {
    // Trigger an entity update
    let response = normalize(action.mediaItem, Schemas.MEDIA_ITEM)
    if (!!action.mediaItem.references) {
        Room.flushComments()
    }

    return next(assign({}, action, { response }))
}

function receiveNotificationComment(store, next, action) {
    // Trigger an entity update
    const response = normalize(action.comment, Schemas.COMMENT)
    return next(assign({}, action, { response }))   
}

function receiveRoomClosed(store, next, action) {
    // Trigger an entity update
    let updatedStack = {
        id: action.roomId,
        closed: true
    }
    const response = normalize(updatedStack, Schemas.STACK)
    return next(assign({}, action, { response }))
}

function receiveBookmarkUpdate(store, next, action) {
    const newStack = {
        id: action.roomId,
        bookmark_count: action.count
    }
    const response = normalize(newStack, Schemas.STACK)
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
        case ActionType.BAN_USER:
            return wrap(ban);
        case ActionType.UNBAN_USER:
            return wrap(unban);
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