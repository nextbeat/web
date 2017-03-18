import assign from 'lodash/assign'

import EddyClient from '../eddy'
import { ActionTypes, Status } from '../actions'
import { Eddy } from '../models'

function _wrapAction(store, next, action) {
    let eddy = new Eddy(store.getState());
    let client = eddy.get('client');

    let actionWith = (status, data) => assign({}, action, { status }, data)

    return (fn) => {
        next(actionWith(Status.REQUESTING))
        fn(action, client)
            .then(() => { next(actionWith(Status.SUCCESS)) })
            .catch((error) => { next(actionWith(Status.FAILURE, { error })) })
    }
}

// TODO: connection failure state

function connect(store, next, action) {
    let client = new EddyClient();
    next(assign({}, action, { status: Status.REQUESTING, client }))
    client.connect().then(() => {
        next(assign({}, action, { status: Status.SUCCESS }))
    })
}

function disconnect(store, next, action) {
    let eddy = new Eddy(store.getState());
    eddy.client.disconnect();
    next(action);
}

function identify(action, client) {
    return client.identify(action.token)
}

function unidentify(action, client) {
    return client.unidentify();
}

export default store => next => action => {
    let wrap = _wrapAction(store, next, action)
    switch (action.type) {
        case ActionTypes.CONNECT_EDDY:
            return connect(store, next, action);
        case ActionTypes.DISCONNECT_EDDY:
            return disconnect(store, next, action);
        case ActionTypes.IDENTIFY_EDDY:
            return wrap(identify);
        case ActionTypes.UNIDENTIFY_EDDY:
            return wrap(unidentify);
        default:
            return next(action);
    }
}