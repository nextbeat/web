import { Map, List } from 'immutable'
import includes from 'lodash/includes'

import app from './app'
import user from './user'
import rooms from './rooms'
import push from './push'
import analytics from './analytics'

import { combineReducers } from './utils'
import { Status, ActionTypes } from '../actions'

const initialEntities = Map({
    stacks: Map(),
    mediaItems: Map(),
    users: Map(),
    comments: Map(),
    tags: Map()
})

function entities(state = initialEntities, action) {
    if (action.response && action.response.entities) {
        return state.mergeDeep(action.response.entities)
    }
    return state
}

// keep track of ongoing fetch requests, allowing
// us to cancel them if need be
function fetches(state = List(), action) {
    if (action.status && action.fetchPromise) {
        if (action.status === Status.REQUESTING) {
            return state.push(Map({ type: action.type, fetchPromise: action.fetchPromise }))
        } else if (action.status === Status.SUCCESS || action.status === Status.FAILURE) {
            return state.filter(f => f.get('fetchPromise') !== action.fetchPromise)
        } 
    }
    if (action.type === ActionTypes.CLEAR_FETCH) {
        return state.filter(f => !includes(action.fetchPromises, f.get('fetchPromise')));
    }

    return state;
}

export default combineReducers({
    entities,
    fetches,
    pages,
    rooms,
    app,
    user,
    push,
    analytics
})