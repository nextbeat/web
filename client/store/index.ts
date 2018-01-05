import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { Map, isCollection } from 'immutable'

import { api, cache, ga, cancel, navigation, ui, upload, push, eddy } from '../middleware'
import { ActionType, Action } from '@actions/types'
import reducer from '@reducers/index'
import { State, Store } from '@types'

const middlewares = [thunkMiddleware, ui, ga, upload, navigation, push, api, cache, cancel, eddy];

const actionTypesToIgnore = [
    ActionType.RESIZE,
    ActionType.USE_CHAT,
    ActionType.HAS_NAVIGATED,
]

if (process.env.NODE_ENV !== "production") {

    const stateTransformer = (state: State) => {
        if (isCollection(state)) return state.toJS();
        else return state;
        
    }

    const predicate = (getState: any, action: Action) => actionTypesToIgnore.indexOf(action.type) === -1

    const logger = createLogger({
        stateTransformer,
        predicate
    });

    if (typeof window !== 'undefined') { // in browser only
        // middlewares.push(logger);
    }
}

export function configureStore(initialState = Map<string, any>()): Store {
    return createStore(
        reducer, 
        initialState, 
        applyMiddleware(...middlewares as any[])
    )
}