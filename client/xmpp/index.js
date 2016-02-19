import XMPP from 'stanza.io'
import moment from 'moment'
import { assign } from 'lodash'
import { normalize } from 'normalizr'
import Schemas from '../schemas'
import { receiveComment, receiveNotificationComment, receiveMediaItem } from '../actions'
import { getPaginatedEntities } from '../utils'

function xmppHost() {
    if (process.env.NODE_ENV === 'production') {
        return 'xmpp.getbubble.me';
    } else if (process.env.NODE_ENV === 'development') {
        return 'xmpp.dev.getbubble.me';
    } else if (process.env.NODE_ENV === 'local') {
        return 'xmpp';
    } else if (process.env.NODE_ENV === 'mac') {
        return 'localhost';
    }
    return '';
}

export function getClient(store) {
    // creates a client unless one is already stored in state
    if (store.getState().hasIn(['user', 'live', 'client'])) {
        return store.getState().getIn(['user', 'live', 'client']) 
    } else {
        let options = {
            transport: 'websocket',
            sasl: ['plain'],
            wsURL: `ws://${xmppHost()}:5280/websocket`,
            credentials: {
                host: 'xmpp.getbubble.me'
            }
        }

        if (store.getState().hasIn(['user', 'meta', 'id'])) {
            // user is logged in
            const uuid = store.getState().getIn(['user', 'meta', 'uuid'])
            options.jid = `${uuid}@xmpp.getbubble.me`
            options.password = uuid
        } else {
            // connecting as anonymous user
            options.jid = 'anon@xmpp.getbubble.me'
        }

        const client = XMPP.createClient(options)

        client.on('groupchat', function(s) {
            handleGroupChat(s, store);
        });

        // client.on('raw:outgoing', function(s) {
        //     console.log('OUTGOING', s);
        // })

        // client.on('raw:incoming', function(s) {
        //     console.log('INCOMING', s);
        // })

        return client;
    }
}

// state status checks

export function isConnected(store) {
    return store.getState().getIn(['user', 'live', 'connected'], false);
}

export function hasJoinedRoom(store) {
    return store.getState().hasIn(['stack', 'live', 'room']);
}

export function isJoiningRoom(store) {
    return store.getState().getIn(['stack', 'live', 'isJoiningRoom']);
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

function formatNotificationItem(data, store) {
    const type = data[1].indexOf('.jpg') !== -1 ? "photo" : "video";
    let count = data[0];
    const mostRecentComment = getPaginatedEntities(store.getState(), 'comments').first()
    console.log(mostRecentComment.toJS());
    if (mostRecentComment.get('type') === 'notification' && mostRecentComment.get('notification_type') === type) {
        count = count - mostRecentComment.get('notification_count') + 1; 
        // TODO: the +1 should not be necessary, there must be a bug on the backend...
    }
    return {
        count: count,
        type: type,
        url: data[1]
    }
}

function handleGroupChat(s, store) {
    if (s.chatState === "active") {
        // received comment
        const message = s.body;
        const nickname = s.from.resource;
        if (nickname !== store.getState().getIn(['stack', 'live', 'nickname'])) {
            return store.dispatch(receiveComment(message, nickname));
        }
    } else if (s.thread) {
        // xmpp message contains a whole host of relevant data
        // we extract it here awkwardly
        const meta = s.thread.split('#');
        const data = s.body.split('#');
        const username = meta.length > 1 ? meta[1] : null;
        const identifier = meta[0];
        switch (identifier) {
            case 'NEW_MEDIA_ITEM':
                const id = parseInt(data[4]);
                const response = normalizeMediaItem(data);
                return store.dispatch(receiveMediaItem(id, response));
            case 'NEW_NOTIFICATION_COMMENT':
                const comment = formatNotificationItem(data, store);
                return store.dispatch(receiveNotificationComment(comment, username));
        }
    }
}