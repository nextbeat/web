import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import api from '../middleware/api'
import { Map } from 'immutable'
import reducer from '../reducers'

export default function configureStore(initialState = Map()) {
    return createStore(
        reducer, 
        initialState, 
        applyMiddleware(thunkMiddleware, api)
    )
}