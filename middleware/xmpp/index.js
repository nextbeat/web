import XMPP from 'stanza.io'
import { assign } from 'lodash'
import { handleGroupChat } from './utils'
import * as ActionTypes from '../../actions'
import { Status } from '../../actions'

function getClient(store) {
    // creates a client unless one is already stored in state
    return store.getState().getIn(['live', 'client']) 
        || XMPP.createClient({
            jid: 'anon@xmpp.getbubble.me',
            transport: 'websocket',
            wsURL: 'ws://localhost:5280/websocket',
            credentials: {
                host: 'xmpp.getbubble.me'
            }
        });
}

// state status checks

function isConnected(store) {
    return store.getState().getIn(['live', 'connected'], false);
}

function hasJoinedRoom(store) {
    return store.getState().getIn(['live', 'joinedRoom'], false);
}

function isJoiningRoom(store) {
    return store.getState().getIn(['live', 'isJoiningRoom'], false);
}

// xmpp connection logic

function connectClient(store, next, action) {
    const client = getClient(store);

    // exit early if client is already connected
    if (isConnected(store)) {
        return next(actionWith(Status.SUCCESS, { client }))
    }
    
    next(actionWith(Status.REQUESTING));

    function actionWith(status, data) {
        return assign({}, action, { status }, data);
    }

    // configure client
    client.on('session:started', function() {
        console.log('session started')
        next(actionWith(Status.SUCCESS, { client }));
    })

    client.on('disconnected', function() {
        next(actionWith(Status.FAILURE));
    })

    client.on('groupchat', function(s) {
        handleGroupChat(s, store);
    });

    client.connect();
}

function joinRoom(store, next, action) {
    const client = getClient(store);

    function actionWith(status, data) {
        return assign({}, action, { status }, data);
    }

    // return early if not connected or if already in room
    if (!isConnected(store)) {
        return next(actionWith(Status.FAILURE));
    } else if (isJoiningRoom(store) || hasJoinedRoom(store)) {
        return null;
    }

    next(actionWith(Status.REQUESTING));

    client.on('muc:join', function(s) {
        next(actionWith(Status.SUCCESS));
    })

    const jid = `${action.uuid}@conference.xmpp.getbubble.me`;
    client.joinRoom(jid, action.nickname);
}

export default store => next => action => {
    
    switch (action.type) {
        case ActionTypes.XMPP_CONNECTION:
            return connectClient(store, next, action);
        case ActionTypes.JOIN_ROOM:
            return joinRoom(store, next, action);
        default:
            return next(action);
    }
}