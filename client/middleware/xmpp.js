import { assign, get } from 'lodash'
import uuid from 'node-uuid'
import { normalize } from 'normalizr'

import * as xmpp from '../xmpp'
import { Status, ActionTypes } from '../actions' 
import * as actions from '../actions'
import { Stack, CurrentUser } from '../models'
import Schemas from '../schemas'

function connectClient(store, next, action) {
    const client = xmpp.getClient(store);
    let stack = new Stack(store.getState());
    let currentUser = new CurrentUser(store.getState());

    // exit early if client is already connected
    if (currentUser.isConnected()) {
        return
    }

    function actionWith(status, data) {
        return assign({}, action, { status }, data);
    }
    
    next(actionWith(Status.REQUESTING));

    // disconnection callback 
    function failureCb() {
        next(actionWith(Status.FAILURE));
    }

    client.once('disconnected', failureCb)

    // resumed stream callback (triggered when reconnecting)
    function resumedCb() {
        next(actionWith(Status.SUCCESS, { client }));
        client.off('disconnected', failureCb)
    }

    client.once('stream:management:resumed', resumedCb)

    // configure client for connection
    client.once('session:started', function() {

        next(actionWith(Status.SUCCESS, { client }));

        client.enableKeepAlive({
            interval: 10,
            timeout: 5,
        });

        client.off('disconnected', failureCb)
        client.off('stream:management:resumed', resumedCb)
        client.sendPresence()

        process.nextTick(() => {
            stack = new Stack(store.getState());
            if (stack.isLoaded()) {
                store.dispatch(actions.joinRoom())
            }
        })
    })

    // if auth fails, register the user
    // TODO: this is not the most elegant way to
    // do this (should have out-of-band registration
    // trigger when user signs up), but reflects
    // behavior of the ios app
    function authFailureCb() {
        client.sendIq({
            type: 'set',
            register: {
                username: currentUser.get('uuid'),
                password: currentUser.get('uuid')
            }
        })
        store.dispatch(actions.connectToXMPP());
    }

    client.once('auth:failed', authFailureCb);

    client.once('auth:success', () => {
        client.off('auth:failed', authFailureCb);
    })

    console.log('connecting...')
    client.connect();
}

function disconnectClient(store, next, action) {
    const client = xmpp.getClient(store);

    function actionWith(status, data) {
        return assign({}, action, { status }, data);
    }

    next(actionWith(Status.REQUESTING));

    client.once('disconnected', function() {
        process.nextTick(() => {
            next(actionWith(Status.SUCCESS));
        })
    })

    client.disconnect();
}

function reconnectClient(store, next, action) {
    let maxBackoff = 5

    function reconnect(timeout, count) {

        let user = new CurrentUser(store.getState())
        if (user.isConnected() || user.get('isConnecting')) {
            return 
        }

        store.dispatch(actions.connectToXMPP());

        setTimeout(() => {
            timeout = count < maxBackoff ? timeout*2 : timeout
            reconnect(timeout, count+1)
        }, timeout)
    }

    reconnect(5000, 0)

    return next(action)
}

function joinRoom(store, next, action) {
    const client = xmpp.getClient(store);
    const currentUser = new CurrentUser(store.getState());
    const stack = new Stack(store.getState());

    function actionWith(status, data) {
        return assign({}, action, { status }, data);
    }

    // return early if not connected or if already in room
    if (!currentUser.isConnected()) {
        return next(actionWith(Status.FAILURE));
    } else if (currentUser.isJoiningRoom() || currentUser.hasJoinedRoom()) {
        return null;
    } else if (!stack.has('id')) {
        return null;
    }

    next(actionWith(Status.REQUESTING));

    const stack_uuid = stack.get('uuid');
    const jid = `${stack_uuid}@conference.xmpp.nextbeat.co`;
    const nickname = currentUser.isLoggedIn() ? `${currentUser.get('username')}#${uuid.v4()}` : uuid.v4();

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

    if (!currentUser.hasJoinedRoom() || !stack.isLoaded()) {
        return null;
    }

    const room = stack.get('room');
    const nickname = stack.get('nickname');
    client.leaveRoom(room, nickname);

    return next(assign({}, action, { status: Status.SUCCESS }))
}

function handleReceiveStackClosed(store, next, action) {
    const stack = new Stack(store.getState())
    let updatedStack = {
        id: stack.get('id'),
        closed: true
    }
    const response = normalize(updatedStack, Schemas.STACK)
    // this triggers a state update in the entities sub-reducer
    return next(assign({}, action, { response }))
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

function handleBeforeUnload(store, next, action) {
    // leave room and disconnect before unloading window
    store.dispatch(actions.leaveRoom())
    store.dispatch(actions.disconnectXMPP())
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
        case ActionTypes.RECONNECT_XMPP:
            return reconnectClient(store, next, action);
        case ActionTypes.JOIN_ROOM:
            return joinRoom(store, next, action);
        case ActionTypes.LEAVE_ROOM:
            return leaveRoom(store, next, action);
        case ActionTypes.SEND_COMMENT:
            return sendComment(store, next, action);
        case ActionTypes.RECEIVE_STACK_CLOSED:
            return handleReceiveStackClosed(store, next, action);
        case ActionTypes.LOGIN:
        case ActionTypes.LOGOUT:
            return handleLoginOrLogout(store, next, action);
        case ActionTypes.STACK:
            return handleLoadStack(store, next, action);
        case ActionTypes.CLEAR_STACK:
            return handleClearStack(store, next, action);
        case ActionTypes.ON_BEFORE_UNLOAD:
            return handleBeforeUnload(store, next, action);
        default:
            return next(action);
    }
}