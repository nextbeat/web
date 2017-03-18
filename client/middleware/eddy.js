import assign from 'lodash/assign'

import EddyClient from '../eddy'
import { ActionTypes } from '../actions'
import { Eddy } from '../models'

// TODO: connection success and failure states

function connect(store, next, action) {
    let client = new EddyClient();
    next(assign(action, { client }));
}

function disconnect(store, next, action) {
    let eddy = new Eddy(store.getState());
    eddy.client.disconnect();
    next(action);
}

export default store => next => action => {
    switch (action.type) {
        case ActionTypes.CONNECT_EDDY:
            return connect(store, next, action);
        case ActionTypes.DISCONNECT_EDDY:
            return disconnect(store, next, action);
        case ActionTypes.IDENTIFY_EDDY:
            return identify(store, next, action);
        case ActionTypes.UNIDENTIFY_EDDY:
            return unidentify(store, next, action);
        default:
            return next(action);
    }
}