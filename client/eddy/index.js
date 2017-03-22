import Promise from 'bluebird'
 
import { receiveComment, receiveMediaItem, receiveRoomClosed, receiveNotification } from '../actions'
import { EddyError } from '../errors'

function eddyHost() {
    switch(process.env.NODE_ENV) {
        case 'development':
            return 'wss://eddy.dev.nextbeat.co:4316/websocket'
        case 'local':
            return 'ws://eddy:4316/websocket'
        case 'mac':
        default:
            return 'ws://localhost:4316/websocket'
    }
}

/**
 * TODO: 
 *
 * - Reconnection logic, connect failure logic
 * DONE - Message queue for messages sent before connection
 * DONE - Heartbeat handling (rewrite ping/pong since browsers dont have support)
 */

export default class EddyClient {

    constructor(store) {
        this.dispatch = store.dispatch;
        this.messageId = 0;
        this.outgoingMessages = {};
        this.messageQueue = [];
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.client = new WebSocket(eddyHost());

            let openListener = (event) => {
                resolve();
                if (this.messageQueue.length > 0) {
                    this.messageQueue.forEach((sendFn) => {
                        sendFn();
                    });
                }  
                this.client.removeEventListener('open', openListener)
            }

            let closeListener = (event) => {
                if (!event.wasClean) {
                    reject(new Error("Could not establish Websocket connection."))
                }
                this.client.removeEventListener('close', closeListener)
            }

            this.client.addEventListener('open', openListener)
            this.client.addEventListener('close', closeListener)

            this.client.addEventListener('message', (event) => {
                let payload = JSON.parse(event.data)
                console.log(payload);
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

            this.pingId = setInterval(() => {
                this.client.send(JSON.stringify({ type: "ping" }))
            }, 60000);
        });
        
    }

    disconnect() {
        this.client.close();
        clearInterval(this.pingId);
    }

    identify(token) {
        return this._send('identify', { token: token });
    }

    unidentify() {
        return this._send('unidentify');
    }

    join(roomId) {
        return this._send('room_join', { room_id: roomId });
    }

    leave(roomId) {
        return this._send('room_leave', { room_id: roomId });
    }

    chat(roomId, message) {
        return this._send('chat', { room_id: roomId, message: message });
    }


    // Private methods

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
            this.outgoingMessages[this.messageId] = (err) => {
                err ? reject(err) : resolve();
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
            let comment = {
                type: "message",
                message: data.message,
                username: data.username
            };
            this.dispatch(receiveComment(roomId, comment));
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
                callback();
            } else {
                callback(new EddyError(payload.error));
            }
        }
        delete this.outgoingMessages[payload.id];
    }

}