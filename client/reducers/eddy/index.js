import { Map } from 'immutable'
import { ActionTypes } from '../../actions'

function connectEddy(state, action) {
    return state.set('client', action.client);
}

export default function(state = Map(), action) {
    switch (action.type) {
        case ActionTypes.CONNECT_EDDY:
            return connectEddy(state, action);
    }
    return state;
}