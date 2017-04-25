import assign from 'lodash/assign'
import { normalize } from 'normalizr'

import EddyClient from '../eddy'
import { ActionTypes, Status } from '../actions'
import { joinRoom, leaveRoom, reconnectEddy, syncUnreadNotifications, triggerAuthError } from '../actions'
import { Eddy, CurrentUser } from '../models'
import Schemas from '../schemas'

function _wrapAction(store, next, action) {
    let eddy = new Eddy(store.getState());
    let client = eddy.get('client');

    let actionWith = (status, data) => assign({}, action, { status }, data)

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

function connect(store, next, action) {
    let eddy = new Eddy(store.getState()) 
    let client;
    if (eddy.client) {
        client = eddy.client;
    } else {
        client = new EddyClient(store);
    }
    
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

function unidentify(action, client) {
    return client.unidentify();
}

function join(action, client) {
    return client.join(action.roomId);
}

function leave(action, client) {
    return client.leave(action.roomId);
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

function loadRoom(store, next, action) {
    let eddy = new Eddy(store.getState());
    if (action.status === Status.SUCCESS) {
        store.dispatch(joinRoom(action.roomId));
    }
    return next(action);
}

function clearRoom(store, next, action) {
    let eddy = new Eddy(store.getState());
    store.dispatch(leaveRoom(action.roomId));
    return next(action);
}

function receiveComment(store, next, action) {
    // Trigger an entity update
    const response = normalize(action.comment, Schemas.COMMENT)
    return next(assign({}, action, { response }))
}

function receiveMediaItem(store, next, action) {
    // Trigger an entity update
    const response = normalize(action.mediaItem, Schemas.MEDIA_ITEM)
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

function receiveNotification(store, next, action) {
    // On receiving a "notification" event,
    // client syncs with the API server to
    // retrieve a new list of unread notifications
    store.dispatch(syncUnreadNotifications());
    return next(action);
}

export default store => next => action => {
    let wrap = _wrapAction(store, next, action)
    switch (action.type) {
        case ActionTypes.CONNECT_EDDY:
            return connect(store, next, action);
        case ActionTypes.RECONNECT_EDDY:
            return reconnect(store, next, action);
        case ActionTypes.DISCONNECT_EDDY:
            return disconnect(store, next, action);
        case ActionTypes.IDENTIFY_EDDY:
            return wrap(identify);
        case ActionTypes.UNIDENTIFY_EDDY:
            return wrap(unidentify);
        case ActionTypes.JOIN_ROOM:
            return wrap(join);
        case ActionTypes.LEAVE_ROOM:
            return wrap(leave);
        case ActionTypes.SEND_COMMENT:
            return wrapSendComment(store, next, action);
        case ActionTypes.BAN_USER:
            return wrap(ban);
        case ActionTypes.UNBAN_USER:
            return wrap(unban);
        case ActionTypes.ROOM:
            return loadRoom(store, next, action)
        case ActionTypes.CLEAR_ROOM:
            return clearRoom(store, next, action)
        case ActionTypes.RECEIVE_COMMENT:
            return receiveComment(store, next, action)
        case ActionTypes.RECEIVE_MEDIA_ITEM:
            return receiveMediaItem(store, next, action)
        case ActionTypes.RECEIVE_NOTIFICATION_COMMENT:
            return receiveNotificationComment(store, next, action)
        case ActionTypes.RECEIVE_ROOM_CLOSED:
            return receiveRoomClosed(store, next, action)
        case ActionTypes.RECEIVE_NOTIFICATION:
            return receiveNotification(store, next, action)
        default:
            return next(action);
    }
}