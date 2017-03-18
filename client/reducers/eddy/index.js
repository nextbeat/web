import { Map } from 'immutable'
import { ActionTypes } from '../../actions'

function connectEddy(state, action) {
    if (action.client) {
        return state.set('client', action.client);
    }
    return state
}

export default function(state = Map(), action) {
    switch (action.type) {
        case ActionTypes.CONNECT_EDDY:
            return connectEddy(state, action);
    }
    return state;
}