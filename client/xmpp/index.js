import XMPP from 'stanza.io'
import moment from 'moment'
import { v4 as generateUuid }from 'node-uuid'
import { assign } from 'lodash'
import { normalize } from 'normalizr'
import Schemas from '../schemas'
import { receiveComment, receiveNotificationComment, receiveMediaItem, receiveStackClosed, syncNotifications, lostXMPPConnection, reconnectXMPP } from '../actions'
import { CurrentUser, Stack } from '../models'

function xmppHost() {
    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'production') {
        return 'xmpp.nextbeat.co';
    } else if (process.env.NODE_ENV === 'development') {
        return 'xmpp.dev.nextbeat.co';
    } else if (process.env.NODE_ENV === 'local') {
        return 'xmpp';
    } else if (process.env.NODE_ENV === 'mac') {
        return 'localhost';
    } else if (process.env.NODE_ENV === 'mac-dev') {
        return 'xmpp.dev.nextbeat.co';
    }
    return '';
}

function xmppScheme() {
    switch(process.env.NODE_ENV) {
        case 'production':
        case 'development':
        case 'mac-dev':
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

        // client.on('stream:management:enabled', function(s) {
        //     console.log('stream management enabled', s)
        // })

        // client.on('stream:management:resumed', function(s) {
        //     console.log('stream management resumed', s)
        // })

        // client.on('stream:management:failed', function(s) {
        //     console.log('stream management failed', s)
        // })

        // client.on('raw:outgoing', function(s) {
        //     console.log('OUTGOING', s);
        // })

        // client.on('raw:incoming', function(s) {
        //     console.log('INCOMING', s);
        // })

        // client.on('stream:error', function(e) {
        //     console.log('stream error', e)
        // })

        client.on('disconnected', function() {
            let currentUser = new CurrentUser(store.getState())
            if (!!currentUser.get('lostConnection')) {
                store.dispatch(reconnectXMPP())
            }
        })

        client.on('stream:error', function(e) {
            if (e.condition === 'connection-timeout') {
                store.dispatch(lostXMPPConnection())
                client.disableKeepAlive();
            }
        })

        return client;
    }
}

// group chat

function formatNotificationItem(data, store) {
    const type = data[0] // "mediaitem" or "close"
    let comment = { type }

    if (type === "mediaitem") {
        assign(comment, {
            count: parseInt(data[1]),
            url: data[2]
        })
        if (data.length >= 5) {
            assign(comment, { id: parseInt(data[4]) })
        }
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
            case 'NEW_MEDIA_ITEM_V2':
                const mediaItem = JSON.parse(s.body)
                const response = normalize(mediaItem, Schemas.MEDIA_ITEM)
                return store.dispatch(receiveMediaItem(mediaItem.id, response));
            case 'NEW_NOTIFICATION_COMMENT':
                const comment = formatNotificationItem(data, store);
                // todo: update 
                return store.dispatch(receiveNotificationComment(comment, username));
            case 'STACK_CLOSED':
                return store.dispatch(receiveStackClosed());
        }
    }
}

// other messages

function handleMessage(s, store) {
    console.log(s);
    if (s.type === "chat") {
        if (s.thread && s.thread === 'NEW_NOTIFICATION') {
            store.dispatch(syncNotifications())
        }
    }
}