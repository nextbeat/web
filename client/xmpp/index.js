import XMPP from 'stanza.io'
import moment from 'moment'
import { v4 as generateUuid }from 'node-uuid'
import { assign } from 'lodash'
import { normalize } from 'normalizr'
import Schemas from '../schemas'
import { receiveComment, receiveNotificationComment, receiveMediaItem, receiveStackClosed, syncNotifications } from '../actions'
import { CurrentUser, Stack } from '../models'

function xmppHost() {
    if (process.env.NODE_ENV === 'production') {
        return 'xmpp.nextbeat.co';
    } else if (process.env.NODE_ENV === 'development') {
        return 'xmpp.dev.nextbeat.co';
    } else if (process.env.NODE_ENV === 'local') {
        return 'xmpp';
    } else if (process.env.NODE_ENV === 'mac') {
        return 'localhost';
    }
    return '';
}

function xmppScheme() {
    switch(process.env.NODE_ENV) {
        case 'production':
        case 'development':
            return 'wss://'
        case 'local':
        case 'mac':
        default:
            return 'ws://'
    }
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
            wsURL: `${xmppScheme()}${xmppHost()}:5280/websocket`,
            useStreamManagement: true
        }

        if (currentUser.isLoggedIn()) {
            // user is logged in
            const uuid = currentUser.get('uuid').toLowerCase();
            options.jid = `${uuid}@xmpp.nextbeat.co`
            options.password = uuid;
            options.resource = generateUuid();
            options.credentials = {
                host: 'xmpp.nextbeat.co'
            }
        } else {
            options.jid = 'anon@anon.xmpp.nextbeat.co'
            options.credentials = {
                host: 'anon.xmpp.nextbeat.co'
            }
        }

        const client = XMPP.createClient(options)

        client.on('groupchat', function(s) {
            handleGroupChat(s, store);
        });

        client.on('message', function(s) {
            handleMessage(s, store);
        });

        // client.on('raw:outgoing', function(s) {
        //     console.log('OUTGOING', s);
        // })

        // client.on('raw:incoming', function(s) {
        //     console.log('INCOMING', s);
        // })

        // client.on('disconnected', function() {
        //     console.log('DISCONNECTED!!!');
        // })

        return client;
    }
}

// group chat

function normalizeMediaItem(data) {
    let mediaItem = {
        type: data[1],
        url: data[2],
        firstframe_url: data[3],
        id: parseInt(data[4]),
        created_at: moment().format()
    }
    if (data[5].length > 0) {
        // recreate decoration object
        let decoration = JSON.parse(data.slice(5).join('#'))
        mediaItem.decoration = decoration
    }
    return normalize(mediaItem, Schemas.MEDIA_ITEM);
}

function formatNotificationItem(data, store) {
    const type = data[0] // "mediaitem" or "close"
    let comment = { type }

    if (type === "mediaitem") {
        let count = data[1]
        const stack = new Stack(store.getState());
        const mostRecentRemoteComment = stack.comments().first()
        if (mostRecentRemoteComment.get('type') === 'notification' && stack.liveComments().size === 0) {
            count = count - mostRecentRemoteComment.get('notification_count')
        } else if (stack.liveComments().size > 0) {
            const mostRecentLiveComment = stack.liveComments().last()
            if (mostRecentLiveComment.get('type') === 'notification') {
                count = mostRecentLiveComment.get('notification_count') + 1
            }
        }
        assign(comment, {
            count: parseInt(count),
            url: data[2]
        })
    }

    return comment
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
                return store.dispatch(receiveStackClosed());
        }
    }
}

// other messages

function handleMessage(s, store) {
    if (s.type === "chat") {
        if (s.thread && s.thread === 'NEW_NOTIFICATION') {
            store.dispatch(syncNotifications())
        }
    }
}