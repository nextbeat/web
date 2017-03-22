import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { api, cache, ga, cancel, ui, upload, push, eddy } from '../middleware'
import { ActionTypes } from '../actions'
import { Map, Iterable } from 'immutable'
import reducer from '../reducers'
import createLogger from '../redux-logger'

const middlewares = [thunkMiddleware, ui, ga, upload, push, api, cache, cancel, eddy];

const actionTypesToIgnore = [
    ActionTypes.RESIZE,
    ActionTypes.USE_CHAT,
    ActionTypes.PROLONG_CHAT_SESSION,
    ActionTypes.ANALYTICS,
    ActionTypes.HAS_NAVIGATED,
]

if (process.env.NODE_ENV !== "production") {

    const stateTransformer = state => {
        if (Iterable.isIterable(state)) return state.toJS();
        else return state;
        
    }

    const predicate = (getState, action) => actionTypesToIgnore.indexOf(action.type) === -1
    // const predicate = (getState, action) => action.type.indexOf("EDDY") !== -1

    const logger = createLogger({
        stateTransformer,
        predicate
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