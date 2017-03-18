import Promise from 'bluebird'

function eddyHost() {
    switch(process.env.NODE_ENV) {
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
 * - Heartbeat handling (rewrite ping/pong since browsers dont have support)
 */

export default class EddyClient {

    constructor() {
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
                    reject(new Error("Could not establing Websocket connection."))
                }
                this.client.removeEventListener('close', closeListener)
            }

            this.client.addEventListener('open', openListener)
            this.client.addEventListener('close', closeListener)

            this.client.addEventListener('message', (event) => {
                let data = JSON.parse(event.data)
                if ('id' in data) {
                    // Message is a response to a message
                    // the client sent out.
                    this._handleResponseMessage(data)
                } else {
                    this._handleMessage(data)
                }
            });

            // this.pingId = setInterval(() => {
            //     this.client.ping();
            // }, 10000);
        });
        
    }

    disconnect() {
        this.client.close();
        // clearInterval(this.pingId);
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

    chat(message) {
        return this._send('chat', { message: message });
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

    _handleMessage(data) {
        console.log(data);
    }

    _handleResponseMessage(data) {
        let callback = this.outgoingMessages[data.id]
        if (typeof callback === 'function') {
            if (data.ok) {
                callback();
            } else {
                callback(new Error(data.error));
            }
        }
        delete this.outgoingMessages[data.id];
    }

}