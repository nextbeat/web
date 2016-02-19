import { assign, get } from 'lodash'
import * as xmpp from '../xmpp'
import * as ActionTypes from '../actions'
import { Status } from '../actions' 
import { getEntity } from '../utils'
import uuid from 'node-uuid'

const actions = ActionTypes

function connectClient(store, next, action) {
    const client = xmpp.getClient(store);

    // exit early if client is already connected
    if (xmpp.isConnected(store)) {
        return next(actionWith(Status.SUCCESS, { client }))
    }

    function actionWith(status, data) {
        return assign({}, action, { status }, data);
    }
    
    next(actionWith(Status.REQUESTING));

    const failureCb = function() {
        console.log('disconnected!!!!');
        next(actionWith(Status.FAILURE));
    }

    client.once('disconnected', failureCb)

    // configure client for connection
    client.once('session:started', function() {
        next(actionWith(Status.SUCCESS, { client }));
        console.log('removing event...')
        client.off('disconnected', failureCb)
        process.nextTick(() => {
            if (store.getState().hasIn(['stack', 'meta', 'id'])) {
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
        console.log('DISCONNECTED');
        next(actionWith(Status.SUCCESS));
    })

    console.log('DISCONNECTING');
    client.disconnect();
}

function joinRoom(store, next, action) {
    const client = xmpp.getClient(store);

    function actionWith(status, data) {
        return assign({}, action, { status }, data);
    }

    // return early if not connected, if already in room, or if not currently looking at a stack
    if (!xmpp.isConnected(store)) {
        return next(actionWith(Status.FAILURE));
    } else if (xmpp.isJoiningRoom(store) || xmpp.hasJoinedRoom(store)) {
        return null;
    } else if (!store.getState().hasIn(['stack', 'meta', 'id'])) {
        return null;
    }

    next(actionWith(Status.REQUESTING));

    const id = store.getState().getIn(['stack', 'meta', 'id'], 0);
    const stack_uuid = getEntity(store.getState(), 'stacks', id).get('uuid');
    const jid = `${stack_uuid}@conference.xmpp.getbubble.me`;
    const nickname = store.getState().hasIn(['user', 'meta', 'id']) ? store.getState().getIn(['user', 'meta', 'username']) : uuid.v4();

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
    if (!xmpp.hasJoinedRoom(store)) {
        return null;
    }
    const client = xmpp.getClient(store)
    const { room, nickname } = store.getState().getIn(['stack', 'live']).toJS()
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
    if (action.status === Status.SUCCESS && store.getState().getIn(['user', 'live', 'connected'])) {
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
        const roomJid = store.getState().getIn(['stack', 'live', 'room']);
        client.sendMessage({
            to: roomJid,
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