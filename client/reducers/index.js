import { Map } from 'immutable'

import app from './app'
import user from './user'
import stack from './stack'
import profile from './profile'
import support from './support'
import channel from './channel'
import { combineReducers } from './utils'

const initialEntities = Map({
    stacks: Map(),
    mediaItems: Map(),
    users: Map(),
    comments: Map(),
    channels: Map()
})

function entities(state = initialEntities, action) {
    if (action.response && action.response.entities) {
        return state.mergeDeep(action.response.entities)
    }
    return state
}

export default combineReducers({
    entities,
    app,
    stack,
    profile,
    channel,
    user,
    support
})