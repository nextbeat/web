import XMPP from 'stanza.io'
import moment from 'moment'
import { assign } from 'lodash'
import { normalize } from 'normalizr'
import Schemas from '../schemas'
import { receiveComment, receiveNotificationComment, receiveMediaItem, receiveStackClosed } from '../actions'
import { CurrentUser, Stack } from '../models'

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
    const currentUser = new CurrentUser(store.getState())
    // creates a client unless one is already stored in state
    if (currentUser.has('client')) {
        return currentUser.get('client');
    } else {
        let options = {
            transport: 'websocket',
            sasl: ['plain'],
            wsURL: `ws://${xmppHost()}:5280/websocket`,
            credentials: {
                host: 'xmpp.getbubble.me'
            }
        }

        if (currentUser.isLoggedIn()) {
            // user is logged in
            const uuid = currentUser.get('uuid');
            options.jid = `${uuid}@xmpp.getbubble.me`
            options.password = uuid
        } else {
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
    const stack = new Stack(store.getState());
    const mostRecentComment = stack.comments().first()
    if (mostRecentComment.get('type') === 'notification' && mostRecentComment.get('notification_type') === type) {
        count = count - mostRecentComment.get('notification_count') + 1; 
        // TODO: the +1 should not be necessary, there must be a bug on the backend...
    }
    return {
        count: parseInt(count),
        type: type,
        url: data[1]
    }
}

function stripNickname(resource) {
    // To allow users to be signed on from multiple clients at the same
    // time (e.g. mobile and web) we append the user's client to their
    // nickname (e.g. foo#web). This function strips the client info.
    return resource.split('#')[0];
}

function handleGroupChat(s, store) {
    const stack = new Stack(store.getState());
    if (s.chatState === "active") {
        // received comment
        const message = s.body;
        const nickname = s.from.resource;

        if (nickname !== stack.get('nickname')) {
            return store.dispatch(receiveComment(message, stripNickname(nickname)));
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
            case 'STACK_CLOSED':
                console.log('received stack closed xmpp')
                return store.dispatch(receiveStackClosed());
        }
    }
}