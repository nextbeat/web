import { assign } from 'lodash'
import * as xmpp from '../xmpp'
import * as ActionTypes from '../actions'
import { Status } from '../actions'

function connectClient(store, next, action) {
    const client = xmpp.getClient(store);

    // exit early if client is already connected
    if (xmpp.isConnected(store)) {
        return next(actionWith(Status.SUCCESS, { client }))
    }
    
    next(actionWith(Status.REQUESTING));

    function actionWith(status, data) {
        return assign({}, action, { status }, data);
    }

    // configure client for connection
    client.on('session:started', function() {
        console.log('session started')
        next(actionWith(Status.SUCCESS, { client }));
    })

    client.on('disconnected', function() {
        next(actionWith(Status.FAILURE));
    })

    client.connect();
}

function joinRoom(store, next, action) {
    const client = xmpp.getClient(store);

    function actionWith(status, data) {
        return assign({}, action, { status }, data);
    }

    // return early if not connected or if already in room
    if (!xmpp.isConnected(store)) {
        return next(actionWith(Status.FAILURE));
    } else if (xmpp.isJoiningRoom(store) || xmpp.hasJoinedRoom(store)) {
        return null;
    }

    next(actionWith(Status.REQUESTING));

    // configure client for joining room
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