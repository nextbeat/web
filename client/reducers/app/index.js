import { Map, List } from 'immutable'
import { inRange } from 'lodash'
import { ActionTypes, Status } from '../../actions'
import { combineReducers } from '../utils'

function tags(state = Map(), action) {
    if (action.type === ActionTypes.TAGS) {
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

function authError(state = false, action) {
    if (action.status && action.status === Status.FAILURE && action.error === "User is not logged in.") {
        return true;
    } else if (action.type === ActionTypes.CLEAR_LOGIN_SIGNUP || action.type === ActionTypes.LOGIN) {
        return false;
    }
    return state;
}

const WIDTH_RANGES = [
    { range: [0, 500], type: 'small' },
    { range: [501, 800], type: 'medium' },
    { range: [801, 1100], type: 'room-medium' },
    { range: [1101, Infinity], type: 'large' } 
]

function state(state = Map(), action) {
    if (action.type === ActionTypes.PROMPT_MODAL) {
        return state.merge({
            modal: action.modalType
        });
    } else if (action.type === ActionTypes.CLOSE_MODAL) {
        return state.delete('modal')
    } else if (action.type === ActionTypes.RESIZE) {
        const size = WIDTH_RANGES.find(r => inRange(Math.max(action.width, 0), ...r.range))['type'];
        return state.merge({
            width: size;
        })
    }
    return state
}

const reducers = {
    tags,
    authError,
    width
    state
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_APP) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}