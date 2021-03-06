import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { Map, isCollection } from 'immutable'

import { api, cache, chat, ga, cancel, navigation, ui, upload, push, eddy } from '../middleware'
import { ActionType, Action } from '@actions/types'
import reducer from '@reducers/index'
import { State, Store } from '@types'

const middlewares = [
    thunkMiddleware, 
    ui, 
    chat,
    ga, 
    upload, 
    push, 
    api, 
    navigation, 
    cache, 
    cancel, 
    eddy
];

const actionTypesToIgnore = [
    ActionType.RESIZE,
    ActionType.USE_CHAT,
    ActionType.HAS_NAVIGATED,
    ActionType.UPDATE_CONTINUOUS_PLAY_COUNTDOWN,
    ActionType.ROOM_INFO
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
        middlewares.push(logger);
    }
}

export function configureStore(initialState = Map<string, any>()): Store {
    return createStore(
        reducer, 
        initialState, 
        applyMiddleware(...middlewares as any[])
    )
}