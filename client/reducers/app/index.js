import { Map, List } from 'immutable'
import { inRange, includes } from 'lodash'
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
    { range: [500, 800], type: 'medium' },
    { range: [800, 1100], type: 'room-medium' },
    { range: [1100, Infinity], type: 'large' } 
]

function state(state = Map(), action) {
    if (action.type === ActionTypes.PROMPT_MODAL) {
        return state.set('modal', action.modalType)
    } else if (action.type === ActionTypes.CLOSE_MODAL) {
        return state.delete('modal')
    } else if (action.type === ActionTypes.SELECT_SIDEBAR) {
        return state.set('overlay', 'sidebar')
    } else if (action.type === ActionTypes.CLOSE_SIDEBAR) {
        return state.delete('overlay')
    } else if (action.type === ActionTypes.SELECT_DETAIL_SECTION) {
        // set as overlay if small or medium screen size
        if (includes(['small', 'medium'], state.get('width'))) {
            return state.set('overlay', action.section)
        }
    } else if (action.type === ActionTypes.CLOSE_DETAIL_SECTION) {
        return state.delete('overlay')
    } else if (action.type === ActionTypes.SET_VIDEO_VOLUME) {
        return state.set('volume', action.volume)
    } else if (action.type === ActionTypes.RESIZE) {
        const width = Math.max(action.width, 0)
        const size = WIDTH_RANGES.find(r => inRange(width, ...r.range))['type'];
        state = state.merge({
            width: size
        })
        if (size === 'room-medium' || size === 'large') {
            state = state.delete('overlay')
        }
        return state
    }
    return state
}

const reducers = {
    tags,
    authError,
    state
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_APP) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}