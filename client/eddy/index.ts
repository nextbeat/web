import * as Promise from 'bluebird'
import assign from 'lodash-es/assign'
import omit from 'lodash-es/omit'

import { 
    receiveComment,
    receiveMediaItem,
    receiveMediaItemUpdate,
    receiveMediaItemDelete,
    receiveRoomClosed,
    receivePinnedComment,
    receiveUnpinnedComment,
    receiveNotificationComment,
    receiveActivityEvent,
    receiveRoomMarked,
    receiveBookmarkUpdate,
    reconnectEddy,
    identifyEddy, 
    joinRoom
} from '@actions/eddy'
import Room from '@models/state/room'
import CurrentUser from '@models/state/currentUser'
import { EddyError, TimeoutError } from '@errors'
import { State, Store, Dispatch } from '@types'

function eddyHost(): string {
    switch(process.env.NODE_ENV) {
        case 'production':
            return 'wss://eddy.nextbeat.co:4316/websocket?origin=web'
        case 'development':
            return 'wss://eddy.dev.nextbeat.co:4316/websocket?origin=web'
        case 'local':
            return 'ws://eddy:4316/websocket?origin=web'
        case 'mac':
        default:
            return 'ws://localhost:4316/websocket?origin=web'
    }
}

const PING_INTERVAL = 10000;
const PONG_TIMEOUT = 3000;
const CONNECT_TIMEOUT = 10000;
const CONNECT_DELAY_CAP = 30000;
const BASE_DELAY = 2000;


/**
 * Type definitions
 */

type EddySendType = 
    'identify' |
    'unidentify' |
    'room_join' |
    'room_leave' |
    'room_info' |
    'chat' |
    'ban' |
    'unban' |
    'pin' |
    'unpin' |
    'bookmark' |
    'unbookmark' |
    'ping'

type EddyReceiveType = 
    'chat' |
    'pinned_chat' |
    'unpinned_chat' |
    'notification_comment' |
    'media_item' |
    'media_item_update' |
    'media_item_delete' |
    'room_closed' |
    'room_marked' |
    'bookmark_update' |
    'activity_event'

interface EddyRoomData {
    room_id: number
    [key: string]: any
}

interface EddySendPayload {
    type: EddySendType
    id: number
    data?: object
}

interface EddyReceivePayload {
    type: EddyReceiveType
    data?: object
}

interface EddyResponsePayload extends EddyReceivePayload {
    id: number
    ok: boolean
    error?: string
}

interface EddyInRoomReceivePayload extends EddyReceivePayload {
    data: EddyRoomData
}


/**
 * Eddy client
 */

export default class EddyClient {

    dispatch: Dispatch;
    getState: (() => State); 
    messageId: number;
    outgoingMessages: { [id: number]: (error: Error | null, responseData: any) => void };
    messageQueue: any[];
    client: WebSocket;

    private pingId: number;
    private connectTimeoutId: number;
    private pongTimeoutId: number;

    constructor(store: Store) {
        this.dispatch = store.dispatch;
        this.getState = store.getState;
        this.messageId = 0;
        this.outgoingMessages = {};
        this.messageQueue = [];
    }

    // Connection logic

    connect() {
        return new Promise((resolve, reject) => {

            this._clear();
            this.client = new WebSocket(eddyHost());
            this.messageId = 0;

            let openListener = (event: Event) => {
                resolve();

                if (this.messageQueue.length > 0) {
                    this.messageQueue.forEach((sendFn) => {
                        sendFn();
                    });
                }  

                this.pingId = window.setInterval(() => {
                    this._sendPing();
                }, PING_INTERVAL);

                this.client.removeEventListener('open', openListener)
                this.client.removeEventListener('close', closeListener)
            }

            let closeListener = (event: CloseEvent) => {
                this._clear();

                if (!event.wasClean) {
                    reject(new Error("Could not establish Websocket connection."))
                }

                this.client.removeEventListener('close', closeListener)
                this.client.removeEventListener('open', openListener)
            }

            this.connectTimeoutId = window.setTimeout(() => {
                if (!this.isConnected()) {
                    this.client.close();
                    reject(new TimeoutError("Websocket connection timeout."))
                }
            }, CONNECT_TIMEOUT);

            this.client.addEventListener('open', openListener)
            this.client.addEventListener('close', closeListener)

            this.client.addEventListener('message', (event: MessageEvent) => {
                let payload = JSON.parse(event.data)
                if ('id' in payload) {
                    // Message is a response to a message
                    // the client sent out.
                    this._handleResponseMessage(payload)
                } else if (payload.data && 'room_id' in payload.data) {
                    // Message sent within a room
                    this._handleInRoomMessage(payload)
                } else {
                    // Message sent to user
                    this._handleMessage(payload)
                }
            });
        });   
    }

    reconnect() {
        return this._reconnect(0, BASE_DELAY);
    }

    disconnect() {
        this.client.close();
    }

    isConnected() {
        return this.client && this.client.readyState === 1;
    }

    // Messages

    identify(token: string) {
        return this._send('identify', { token: token });
    }

    unidentify() {
        return this._send('unidentify');
    }

    join(roomId: number) {
        return this._send('room_join', { room_id: roomId });
    }

    leave(roomId: number) {
        return this._send('room_leave', { room_id: roomId });
    }

    getRoomInfo(roomId: number) {
        return this._send('room_info', { room_id: roomId });
    }

    chat(roomId: number, message: string) {
        return this._send('chat', { room_id: roomId, message: message });
    }

    pin(roomId: number, message: string) {
        return this._send('pin', { room_id: roomId, message: message });
    }

    unpin(roomId: number) {
        return this._send('unpin', { room_id: roomId });
    }

    bookmark(roomId: number) {
        return this._send('bookmark', { room_id: roomId })
    }

    unbookmark(roomId: number) {
        return this._send('unbookmark', { room_id: roomId })
    }

    ban(roomId: number, username: string) {
        return this._send('ban', { room_id: roomId, username: username });
    }

    unban(roomId: number, username: string) {
        return this._send('unban', { room_id: roomId, username: username });
    }

    // Message sending and receiving

    private _send(type: EddySendType, data?: object) {
        return new Promise((resolve, reject) => {
            // Increment message id; each message should have
            // a unique id.
            this.messageId += 1;

            // Define payload object.
            let payload: EddySendPayload = { 
                id: this.messageId,
                type,
                data
            }

            // Store callback in dictionary of outgoing messages.
            // When client receives a reply from the server, the
            // promise is fulfilled. TODO: handle timeout
            this.outgoingMessages[this.messageId] = (err, responseData) => {
                err ? reject(err) : resolve(responseData);
            }

            // TODO: wrap in second promise? to send queue messages sequentially
            let sendMessage = () => {
                this.client.send(JSON.stringify(payload));
            }

            if (this.client.readyState !== 1) {
                this.messageQueue.unshift(sendMessage);
            } else {
                sendMessage();
            }
        })  
    }

    private _handleResponseMessage(payload: EddyResponsePayload) {
        let callback = this.outgoingMessages[payload.id]
        if (typeof callback === 'function') {
            if (payload.ok) {
                callback(null, payload.data);
            } else {
                callback(new EddyError(payload.error), null);
            }
        }
        delete this.outgoingMessages[payload.id];
    }

    private _handleInRoomMessage(payload: EddyInRoomReceivePayload) {
        let data = payload.data;
        let roomId = data.room_id;

        if (payload.type === "chat") 
        {
            let comment = assign(omit(data, 'room_id'), {
                type: "message",
                stack_id: roomId
            })
            this.dispatch(receiveComment(roomId, comment));
        } 
        else if (payload.type === "pinned_chat")
        {
            let comment = assign(omit(data, 'room_id'), {
                type: "message"
            })
            this.dispatch(receivePinnedComment(roomId, data));
        }
        else if (payload.type === "unpinned_chat") 
        {
            this.dispatch(receiveUnpinnedComment(roomId));
        }
        else if (payload.type === "notification_comment")
        {
            this.dispatch(receiveNotificationComment(roomId, data.comment))
        }
        else if (payload.type === "media_item") 
        {
            this.dispatch(receiveMediaItem(roomId, data.media_item));
        }
        else if (payload.type === "media_item_update") 
        {   
            this.dispatch(receiveMediaItemUpdate(roomId, data.media_item));
        }
        else if (payload.type === "media_item_delete")
        {
            this.dispatch(receiveMediaItemDelete(roomId, data.media_item_id));
        }
        else if (payload.type === "room_closed")
        {
            this.dispatch(receiveRoomClosed(roomId));
        }
        else if (payload.type === "room_marked") 
        {
            this.dispatch(receiveRoomMarked(roomId, data.unread_count))
        }
        else if (payload.type === "bookmark_update") 
        {
            // TODO: replace with bookmark_update event?
            this.dispatch(receiveBookmarkUpdate(roomId, data.count))
        }
    }

    private _handleMessage(payload: EddyReceivePayload) {
        if (payload.type === "activity_event") 
        {
            this.dispatch(receiveActivityEvent())
        }
    }


    // Connection logic

    private _sendPing() {
        var pingPromise = this._send("ping");
        this.pongTimeoutId = window.setTimeout(() => {
            if (!pingPromise.isFulfilled()) {
                // pong has not responded in a timely manner
                // we assume the worst, and attempt to reconnect
                this.dispatch(reconnectEddy());
            }
        }, PONG_TIMEOUT);
    }

    private _reconnect(attempts: number, baseDelayTime: number): Promise<any> {
        return this.connect()
            .bind(this)
            .then(() => {
                // client needs to re-identify and join any rooms 
                // they were in before they were disconnected
                // TODO: actually stream reconnection support on eddy

                const state = this.getState()
                if (CurrentUser.isLoggedIn(state)) {
                    this.dispatch(identifyEddy(CurrentUser.get(state, 'token')))
                }

                let loadedRooms = Room.loadedRoomIds(this.getState())
                loadedRooms.forEach((roomId: number) => {
                    this.dispatch(joinRoom(roomId))
                });
            })
            .catch((e) => {
                let delay = Math.min(CONNECT_DELAY_CAP, baseDelayTime * Math.pow(2, Math.min(attempts, 15)))
                let delayWithJitter = delay/2 + Math.random()*delay/2
                return Promise.resolve()
                    .delay(delayWithJitter)
                    .bind(this)
                    .then(() => {
                        return this._reconnect(attempts+1, baseDelayTime);
                    });
            });
    }

    private _clear() {
        if (this.client && this.client.readyState !== 3) {
            this.client.close();
        }
        clearInterval(this.pingId);
        clearTimeout(this.pongTimeoutId);
        clearTimeout(this.connectTimeoutId);
        this.messageId = 0;
        this.outgoingMessages = {};
        this.messageQueue = [];
    }
}