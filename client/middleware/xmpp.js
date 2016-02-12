import { assign } from 'lodash'
import * as xmpp from '../xmpp'
import * as ActionTypes from '../actions'
import { Status, changeNickname } from '../actions'

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

    const jid = `${action.uuid}@conference.xmpp.getbubble.me`;

    // configure client for joining room
    client.on('muc:join', function(s) {
        next(actionWith(Status.SUCCESS, { jid }));
    })

    client.joinRoom(jid, action.nickname);
}

function handleLogin(store, next, action) {
    if (action.status === Status.SUCCESS) {
        const client = xmpp.getClient(store);
        const nickname = action.user.username;
        const roomJid = store.getState().getIn(['live', 'room']);
        if (store.getState().getIn(['live', 'nickname']) !== nickname) {
            client.changeNick(roomJid, nickname);
            next(changeNickname(nickname));
        }
    }

    return next(action);
}

function sendComment(store, next, action) {
    // once the xmpp middleware receives this, it will already
    // have gone through the api middleware, so we can see if
    // the comment has successfully been submitted
    if (action.status === Status.SUCCESS) {
        const client = xmpp.getClient(store);
        const roomJid = store.getState().getIn(['live', 'room']);
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
        case ActionTypes.XMPP_CONNECTION:
            return connectClient(store, next, action);
        case ActionTypes.JOIN_ROOM:
            return joinRoom(store, next, action);
        case ActionTypes.SEND_COMMENT:
            return sendComment(store, next, action);
        case ActionTypes.LOGIN:
            return handleLogin(store, next, action);
        default:
            return next(action);
    }
}