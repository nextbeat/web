import { Map, List, fromJS } from 'immutable'
import includes from 'lodash/includes'
import keys from 'lodash/keys'

import app from './app'
import user from './user'
import eddy from './eddy'
import rooms from './rooms'
import push from './push'
import upload from './upload'
import pages from './pages'

import { combineReducers } from './utils'
import { Status, ActionType, Action } from '@actions/types'

const initialEntities = Map({
    stacks: Map(),
    mediaItems: Map(),
    users: Map(),
    comments: Map(),
    tags: Map()
})

function entities(state = initialEntities, action: Action) {
    if (action.response && action.response.entities) {
        let entities = action.response.entities
        // we want to merge individual entities, but we don't 
        // want to recursively merge their object properties
        keys(entities).forEach((entityTypeKey: string) => {
            state = state.update(entityTypeKey, Map(), entityTypeMap => {
                keys(entities[entityTypeKey]).forEach((entityIdKey: string) => {
                    entityTypeMap = entityTypeMap.update(entityIdKey, Map(), 
                        (entity: Map<string, any>) => entity.merge(entities[entityTypeKey][entityIdKey]) 
                    )
                })
                return entityTypeMap
            })
        })
    }
    return state
}

// keep track of ongoing fetch requests, allowing
// us to cancel them if need be
function fetches(state = List(), action: Action) {
    if (action.status && action.fetchPromise) {
        if (action.status === Status.REQUESTING) {
            return state.push(Map({ type: action.type, fetchPromise: action.fetchPromise }))
        } else if (action.status === Status.SUCCESS || action.status === Status.FAILURE) {
            return state.filter(f => f.get('fetchPromise') !== action.fetchPromise)
        } 
    }
    if (action.type === ActionType.CLEAR_FETCH) {
        return state.filter(f => !includes(action.fetchPromises, f.get('fetchPromise')));
    }

    return state;
}

export default combineReducers({
    entities,
    fetches,
    pages,
    rooms,
    upload,
    app,
    user,
    eddy,
    push
})