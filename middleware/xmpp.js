import XMPP from 'stanza.io'
import { assign } from 'lodash'
import * as ActionTypes from '../actions'
import { Status, receiveComment } from '../actions'

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

function isConnected(store) {
    return store.getState().getIn(['live', 'connected'], false);
}

function hasJoinedRoom(store) {
    return store.getState().getIn(['live', 'joinedRoom'], false);
}

function isJoiningRoom(store) {
    return store.getState().getIn(['live', 'isJoiningRoom'], false);
}

function configureClient(client, store) {
    client.on('groupchat', function(s) {
        // todo: check thread type
        const message = s.body;
        const nickname = s.from.resource;
        store.dispatch(receiveComment(message, nickname));
    });
}

function connectClient(store, next, action) {
    const client = getClient(store);

    // exit early if client is already connected
    if (isConnected(store)) {
        return next(actionWith(Status.COMPLETE, { client }))
    }
    
    next(actionWith(Status.REQUESTING));

    function actionWith(status, data) {
        return assign({}, action, { status }, data);
    }

    client.on('session:started', function() {
        console.log('session started')
        next(actionWith(Status.COMPLETE, { client }));
    })

    client.on('disconnected', function() {
        next(actionWith(Status.FAILURE));
    })

    configureClient(client, store);
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
        next(actionWith(Status.COMPLETE));
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