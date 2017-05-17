import Promise from 'bluebird'
import assign from 'lodash/assign'
import omit from 'lodash/omit'
 
import { receiveComment, receiveMediaItem, receiveRoomClosed, 
         receivePinnedComment, receiveUnpinnedComment,
         receiveNotificationComment, receiveNotification, 
         reconnectEddy, identifyEddy, joinRoom } from '../actions'
import { Room, CurrentUser } from '../models'
import { EddyError, TimeoutError } from '../errors'

function eddyHost() {
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

export default class EddyClient {

    constructor(store) {
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

            let openListener = (event) => {
                resolve();

                if (this.messageQueue.length > 0) {
                    this.messageQueue.forEach((sendFn) => {
                        sendFn();
                    });
                }  

                this._pingId = setInterval(() => {
                    this._sendPing();
                }, PING_INTERVAL);

                this.client.removeEventListener('open', openListener)
                this.client.removeEventListener('close', closeListener)
            }

            let closeListener = (event) => {
                console.log('close listener!')
                this._clear();

                if (!event.wasClean) {
                    reject(new Error("Could not establish Websocket connection."))
                }

                this.client.removeEventListener('close', closeListener)
                this.client.removeEventListener('open', openListener)
            }

            this._connectTimeoutId = setTimeout(() => {
                if (!this.isConnected()) {
                    this.client.close();
                    this.client = null;
                    reject(new TimeoutError("Websocket connection timeout."))
                }
            }, CONNECT_TIMEOUT);

            this.client.addEventListener('open', openListener)
            this.client.addEventListener('close', closeListener)

            this.client.addEventListener('message', (event) => {
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

    identify(token) {
        return this._send('identify', { token: token });
    }

    unidentify() {
        return this._send('unidentify');
    }

    join(roomId) {
        return this._send('room_join', { room_id: parseInt(roomId, 10) });
    }

    leave(roomId) {
        return this._send('room_leave', { room_id: parseInt(roomId, 10) });
    }

    getRoomInfo(roomId) {
        return this._send('room_info', { room_id: parseInt(roomId, 10) });
    }

    chat(roomId, message) {
        return this._send('chat', { room_id: parseInt(roomId, 10), message: message });
    }

    pin(roomId, message) {
        return this._send('pin', { room_id: parseInt(roomId, 10), message: message });
    }

    unpin(roomId) {
        return this._send('unpin', { room_id: parseInt(roomId, 10)});
    }

    ban(roomId, username) {
        return this._send('ban', { room_id: parseInt(roomId, 10), username: username });
    }

    unban(roomId, username) {
        return this._send('unban', { room_id: parseInt(roomId, 10), username: username });
    }


    /*****************
     * Private methods
     *****************/

    // Message sending and receiving

    _send(type, data) {
        return new Promise((resolve, reject) => {
            // Increment message id; each message should have
            // a unique id.
            this.messageId += 1;

            // Define payload object.
            let payload = { 
                id: this.messageId,
                type
            }
            if (data) {
                payload.data = data;
            }

            // Store callback in dictionary of outgoing messages.
            // When client receives a reply from the server, the
            // promise is fulfilled. TODO: handle timeout
            this.outgoingMessages[this.messageId] = (err, responseData) => {
                err ? reject(err) : resolve(responseData);
            }

            // TODO: wrap in second promise? to send queue messages sequentially
            let sendMessage = () => {
                this.client.send(JSON.stringify(payload), { binary: true }, (err) => {
                    // If there is a connection error,
                    // catch it here and delete callback.
                    if (err) {
                        delete this.outgoingMessages[this.messageId];
                        reject(err);
                    }
                });
            }

            if (this.client.readyState !== 1) {
                this.messageQueue.unshift(sendMessage);
            } else {
                sendMessage();
            }
        })  
    }

    _handleInRoomMessage(payload) {
        let data = payload.data;
        let roomId = data.room_id;

        if (payload.type === "chat") 
        {
            let comment = assign(omit(data, 'room_id'), {
                type: "message"
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
        else if (payload.type === "room_closed")
        {
            this.dispatch(receiveRoomClosed(roomId));
        }
    }

    _handleMessage(payload) {
        if (payload.type === "notification") {
            this.dispatch(receiveNotification())
        }
    }

    _handleResponseMessage(payload) {
        let callback = this.outgoingMessages[payload.id]
        if (typeof callback === 'function') {
            if (payload.ok) {
                callback(null, payload.data);
            } else {
                callback(new EddyError(payload.error));
            }
        }
        delete this.outgoingMessages[payload.id];
    }


    // Connection logic

    _sendPing() {
        var pingPromise = this._send("ping");
        this._pongTimeoutId = setTimeout(() => {
            if (!pingPromise.isFulfilled()) {
                // pong has not responded in a timely manner
                // we assume the worst, and attempt to reconnect
                this.dispatch(reconnectEddy());
            }
        }, PONG_TIMEOUT);
    }

    _reconnect(attempts, baseDelayTime) {
        return this.connect()
            .bind(this)
            .then(() => {
                // client needs to re-identify and 
                // join any rooms they were
                // in before they were disconnected
                // TODO: actually stream reconnection support on eddy
                let currentUser = new CurrentUser(this.getState())
                if (currentUser.isLoggedIn()) {
                    this.dispatch(identifyEddy(currentUser.get('token')))
                }

                let loadedRooms = Room.loadedRooms(this.getState())
                loadedRooms.forEach((room) => {
                    this.dispatch(joinRoom(room.id))
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

    _clear() {
        if (this.client && this.client.readyState !== 3) {
            this.client.close();
        }
        this.client = null;
        clearInterval(this._pingId);
        clearTimeout(this._pongTimeoutId);
        clearTimeout(this._connectTimeoutId);
        this.messageId = 0;
        this.outgoingMessages = {};
        this.messageQueue = [];
    }
}