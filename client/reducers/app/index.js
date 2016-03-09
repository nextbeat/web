import { Map, List } from 'immutable'
import { ActionTypes, Status } from '../../actions'
import { combineReducers } from '../utils'

function channels(state = Map(), action) {
    if (action.type === ActionTypes.CHANNELS) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                isFetching: true
            }).delete('error').delete('ids')
        } else if (action.status === Status.SUCCESS) {
            return state.merge({
                isFetching: false,
                ids: List(action.response.result)
            })
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                isFetching: false,
                error: action.error
            })
        }
    }
    return state
}

const reducers = {
    channels
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_APP) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}