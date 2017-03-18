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
 * - Reconnection logic
 * - Message queue for messages sent before connection
 * - Better heartbeat handling
 */

export default class EddyClient {

    constructor() {
        this.connect();
    }

    connect() {
        this.client = new WebSocket(eddyHost());
        this.messageId = 0;
        this.outgoingMessages = {};

        this.client.addEventListener('message', (event) => {
            let data = JSON.parse(event.data)
            if ('id' in data) {
                // Message is a response to a message
                // the client sent out.
                this._handleResponseMessage(data)
            } else {
                this._handleMessage(data)
            }
        })

        // this.pingId = setInterval(() => {
        //     this.client.ping();
        // }, 10000);
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

    sendChat(message) {
        return this._send('chat', { message: message });
    }


    // Private methods

    _send(type, data) {
        return new Promise((resolve, reject) => {
            let payload = { 
                id: this.messageId,
                type
            }

            if (data) {
                payload.data = data;
            }

            // Increment message id; each message should have
            // a unique id.
            this.messageId += 1;

            // Store callback in dictionary of outgoing messages.
            // When client receives a reply from the server, the
            // promise is fulfilled. TODO: handle timeout
            this.outgoingMessages[this.messageId] = (err) => {
                err ? reject(err) : resolve();
            }

            // Send message.
            this.client.send(JSON.stringify(payload), { binary: true }, function(err) {
                // If there is a connection error,
                // catch it here and delete callback.
                if (err) {
                    delete this.outgoingMessages[this.messageId];
                    reject(err);
                }
            });
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