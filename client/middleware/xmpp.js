import { assign, get } from 'lodash'
import * as xmpp from '../xmpp'
import * as ActionTypes from '../actions'
import { Status } from '../actions' 
import { Stack, CurrentUser } from '../models'
import uuid from 'node-uuid'

const actions = ActionTypes;

function connectClient(store, next, action) {
    const client = xmpp.getClient(store);
    const stack = new Stack(store.getState());
    const currentUser = new CurrentUser(store.getState());

    // exit early if client is already connected
    if (currentUser.isConnected()) {
        return next(actionWith(Status.SUCCESS, { client }))
    }

    function actionWith(status, data) {
        return assign({}, action, { status }, data);
    }
    
    next(actionWith(Status.REQUESTING));

    function failureCb() {
        next(actionWith(Status.FAILURE));
    }

    client.once('disconnected', failureCb)

    // configure client for connection
    client.once('session:started', function() {
        next(actionWith(Status.SUCCESS, { client }));
        client.off('disconnected', failureCb)
        process.nextTick(() => {
            if (stack.has('id')) {
                // stack is loaded, client is connected; join room
                store.dispatch(actions.joinRoom())
            }
        })
    })

    client.connect();
}

function disconnectClient(store, next, action) {
    const client = xmpp.getClient(store);

    function actionWith(status, data) {
        return assign({}, action, { status }, data);
    }

    next(actionWith(Status.REQUESTING));

    client.once('disconnected', function() {
        next(actionWith(Status.SUCCESS));
    })

    client.disconnect();
}

function joinRoom(store, next, action) {
    const client = xmpp.getClient(store);
    const currentUser = new CurrentUser(store.getState());
    const stack = new Stack(store.getState());

    function actionWith(status, data) {
        return assign({}, action, { status }, data);
    }

    // return early if not connected, if already in room, or if not currently looking at a stack
    if (!currentUser.isConnected()) {
        return next(actionWith(Status.FAILURE));
    } else if (currentUser.isJoiningRoom() || currentUser.hasJoinedRoom()) {
        return null;
    } else if (!stack.has('id')) {
        return null;
    }

    next(actionWith(Status.REQUESTING));

    const stack_uuid = stack.get('uuid');
    const jid = `${stack_uuid}@conference.xmpp.getbubble.me`;
    const nickname = currentUser.isLoggedIn() ? currentUser.get('username') : uuid.v4();

    function removeRoomListeners() {
        client.off('presence', roomJoinedCb)
        client.off('presence:error', roomErrorCb)
    }

    function roomJoinedCb(s) {
        if (get(s, 'muc.codes', []).indexOf('110') !== -1) {
            // presence stanza which indicates user has joined room
            removeRoomListeners()
            next(actionWith(Status.SUCCESS, { jid, nickname }))
        }
    }

    function roomErrorCb(s) {
        if (get(s, 'error.code') === "403") {
            removeRoomListeners()
            next(actionWith(Status.FAILURE))
        }
    }

    client.on('presence', roomJoinedCb);
    client.on('presence:error', roomErrorCb)

    client.joinRoom(jid, nickname);
}

function leaveRoom(store, next, action) {
    const client = xmpp.getClient(store);
    const stack = new Stack(store.getState());
    const currentUser = new CurrentUser(store.getState());

    if (!currentUser.hasJoinedRoom()) {
        return null;
    }

    const room = stack.get('room');
    const nickname = stack.get('nickname');
    client.leaveRoom(room, nickname);

    next(assign({}, action, { status: Status.SUCCESS }))
}

function handleLoginOrLogout(store, next, action) {
    // on user login or logout, we want to reconnect as either an 
    // authenticated user or an anonymous user, respectively
    if (action.status === Status.SUCCESS) {
        const client = xmpp.getClient(store);
        store.dispatch(actions.leaveRoom())    
        store.dispatch(actions.disconnectXMPP())
        client.once('disconnected', function() {
            process.nextTick(() => {
                store.dispatch(actions.connectToXMPP())
            })
        })
    }

    return next(action);
}

function handleLoadStack(store, next, action) {
    const currentUser = new CurrentUser(store.getState());
    if (action.status === Status.SUCCESS && currentUser.isConnected()) {
        process.nextTick(() => {
            store.dispatch(actions.joinRoom())
        })
    }

    return next(action);
}

function handleClearStack(store, next, action) {
    store.dispatch(actions.leaveRoom())
    return next(action);
}

function sendComment(store, next, action) {
    // once the xmpp middleware receives this, it will already
    // have gone through the api middleware, so we can see if
    // the comment has successfully been submitted
    if (action.status === Status.SUCCESS) {
        const client = xmpp.getClient(store);
        const stack = new Stack(store.getState());
        const room = stack.get('room');

        client.sendMessage({
            to: room,
            type: 'groupchat',
            body: action.message,
            chatState: 'active'
        })
    }
    return next(action);
}

export default store => next => action => {  
    switch (action.type) {
        case ActionTypes.CONNECT_XMPP:
            return connectClient(store, next, action);
        case ActionTypes.DISCONNECT_XMPP:
            return disconnectClient(store, next, action);
        case ActionTypes.JOIN_ROOM:
            return joinRoom(store, next, action);
        case ActionTypes.LEAVE_ROOM:
            return leaveRoom(store, next, action);
        case ActionTypes.SEND_COMMENT:
            return sendComment(store, next, action);
        case ActionTypes.LOGIN:
        case ActionTypes.LOGOUT:
            return handleLoginOrLogout(store, next, action);
        case ActionTypes.STACK:
            return handleLoadStack(store, next, action);
        case ActionTypes.CLEAR_STACK:
            return handleClearStack(store, next, action);
        default:
            return next(action);
    }
}