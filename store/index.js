import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { api, xmpp } from '../middleware'
import { Map } from 'immutable'
import reducer from '../reducers'

export default function configureStore(initialState = Map()) {
    return createStore(
        reducer, 
        initialState, 
        applyMiddleware(thunkMiddleware, api, xmpp)
    )
}