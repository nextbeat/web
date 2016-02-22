import { Map, List } from 'immutable'
import { ActionTypes, Status } from '../../actions'

function connectXmpp(state, action) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isConnecting: true
            })
        case Status.SUCCESS:
            return state.merge({
                isConnecting: false,
                connected: true,
                client: action.client
            })
        case Status.FAILURE:
            return state.merge({
                isConnecting: false,
                connected: false
            })
    }
    return state;
}

function disconnectXmpp(state, action) {
    switch (action.status) {
        case Status.SUCCESS: 
            return state.merge({
                connected: false
            }).delete('client')
    }
    return state;
}

export default function(state = Map(), action) {
    switch (action.type) {
        case ActionTypes.CONNECT_XMPP:
            return connectXmpp(state, action)
        case ActionTypes.DISCONNECT_XMPP:
            return disconnectXmpp(state, action)
    }
    return state;
}