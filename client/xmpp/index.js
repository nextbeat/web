import XMPP from 'stanza.io'
import moment from 'moment'
import { assign } from 'lodash'
import { normalize } from 'normalizr'
import Schemas from '../schemas'
import { receiveComment, receiveNotificationComment, receiveMediaItem } from '../actions'

export function getClient(store) {
    // creates a client unless one is already stored in state
    if (store.getState().hasIn(['live', 'client'])) {
        return store.getState().getIn(['live', 'client']) 
    } else {
        const client = XMPP.createClient({
            jid: 'anon@xmpp.getbubble.me',
            transport: 'websocket',
            wsURL: 'ws://localhost:5280/websocket',
            credentials: {
                host: 'xmpp.getbubble.me'
            }
        });

        client.on('groupchat', function(s) {
            handleGroupChat(s, store);
        });

        return client;
    }
}

// state status checks

export function isConnected(store) {
    return store.getState().getIn(['live', 'connected'], false);
}

export function hasJoinedRoom(store) {
    return store.getState().getIn(['live', 'joinedRoom'], false);
}

export function isJoiningRoom(store) {
    return store.getState().getIn(['live', 'isJoiningRoom'], false);
}

// group chat

function normalizeMediaItem(data) {
    const mediaItem = {
        type: data[1],
        url: data[2],
        firstframe_url: data[3],
        id: parseInt(data[4]),
        created_at: moment().format()
    }
    return normalize(mediaItem, Schemas.MEDIA_ITEM);
}

function handleGroupChat(s, store) {
    if (s.chatState === "active") {
        // received comment
        const message = s.body;
        const nickname = s.from.resource;
        return store.dispatch(receiveComment(message, nickname));
    } else {
        // xmpp message contains a whole host of relevant data
        // we extract it here awkwardly
        const meta = s.thread.split('#');
        const data = s.body.split('#');
        const username = meta.length > 1 ? meta[1] : null;
        const identifier = meta[0];
        switch (identifier) {
            case 'NEW_MEDIA_ITEM':
                const id = data[4];
                const response = normalizeMediaItem(data);
                return store.dispatch(receiveMediaItem(id, response));
            case 'NEW_NOTIFICATION_COMMENT':
                const type = data[1].indexOf('.jpg') !== -1 ? "photo" : "video";
                return store.dispatch(receiveNotificationComment({
                    count: data[0],
                    type: type,
                    url: data[1]
                }, username));
        }
    }
}