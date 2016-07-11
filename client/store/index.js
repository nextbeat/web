import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { api, analytics, xmpp, cancel } from '../middleware'
import { Map, Iterable } from 'immutable'
import reducer from '../reducers'

const middlewares = [thunkMiddleware, api, analytics, cancel, xmpp];

if (process.env.NODE_ENV !== "production") {
    const createLogger = require('redux-logger');

    const stateTransformer = state => {
        if (Iterable.isIterable(state)) return state.toJS();
        else return state;
    }

    const logger = createLogger({
        stateTransformer
    });

    if (typeof window !== 'undefined') { // in browser only
        middlewares.push(logger);
    }
}

export default function configureStore(initialState = Map()) {
    return createStore(
        reducer, 
        initialState, 
        applyMiddleware(...middlewares)
    )
}