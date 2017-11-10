import { Map, fromJS } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { ConnectEddyAction, ReconnectEddyAction } from '@actions/eddy'
import { State } from '@types'

function connectEddy(state: State, action: ConnectEddyAction) {
    if (action.client) {
        state = state.set('client', action.client);
    }

    if (action.status === Status.FAILURE) {
        state = state.set('hasLostConnection', true);
    }

    return state;
}

function reconnectEddy(state: State, action: ReconnectEddyAction) {
    switch (action.status) {
        case Status.REQUESTING:
        case Status.FAILURE:
            return state.set('hasLostConnection', true);
        case Status.SUCCESS:
            return state.set('hasLostConnection', false);
    }
    return state;
}

const initialState = fromJS({
    client: null,
    hasLostConnection: false
})

export default function(state = initialState, action: Action) {
    switch (action.type) {
        case ActionType.CONNECT_EDDY:
            return connectEddy(state, action);
        case ActionType.RECONNECT_EDDY:
            return reconnectEddy(state, action);
    }
    return state;
}