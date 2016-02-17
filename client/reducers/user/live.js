import { Map, List } from 'immutable'
import * as ActionTypes from '../../actions'
import { Status } from '../../actions'

function xmppConnection(state, action) {
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

export default function(state = Map(), action) {
    switch (action.type) {
        case ActionTypes.XMPP_CONNECTION:
            return xmppConnection(state, action)
    }
    return state;
}