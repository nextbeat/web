import { Map } from 'immutable'
import { ActionTypes, Status } from '../../actions'

function connectEddy(state, action) {
    if (action.client) {
        state = state.set('client', action.client);
    }

    if (action.status === Status.FAILURE) {
        state = state.set('hasLostConnection', true);
    }

    return state;
}

function reconnectEddy(state, action) {
    switch (action.status) {
        case Status.REQUESTING:
        case Status.FAILURE:
            return state.set('hasLostConnection', true);
        case Status.SUCCESS:
            return state.set('hasLostConnection', false);
    }
    return state;
}

const initialState = {
    client: null,
    hasLostConnection: false
}

export default function(state = initialState, action) {
    switch (action.type) {
        case ActionTypes.CONNECT_EDDY:
            return connectEddy(state, action);
        case ActionTypes.RECONNECT_EDDY:
            return reconnectEddy(state, action);
    }
    return state;
}