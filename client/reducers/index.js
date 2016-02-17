import { Map } from 'immutable'

import user from './user'
import stack from './stack'
import profile from './profile'
import { combineReducers } from './utils'

const initialEntities = Map({
    stacks: Map(),
    mediaItems: Map(),
    users: Map(),
    comments: Map()
})

function entities(state = initialEntities, action) {
    if (action.response && action.response.entities) {
        return state.mergeDeep(action.response.entities)
    }
    return state
}

export default combineReducers({
    entities,
    stack,
    profile,
    user
})