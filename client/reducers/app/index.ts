import { Map, List, Set } from 'immutable'
import inRange from 'lodash-es/inRange'
import includes from 'lodash-es/includes'
import find from 'lodash-es/find'

import { ActionType, Status, Action } from '@actions/types'
import { combineReducers } from '@reducers/utils'
import { NotLoggedInError } from '@errors'

function tags(state = Map(), action: Action) {
    if (action.type === ActionType.TAGS) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                isFetching: true
            }).delete('error').delete('ids')
        } else if (action.status === Status.SUCCESS) {
            return state.merge({
                isFetching: false,
                ids: List((action.response as any).result)
            })
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                isFetching: false,
                error: action.error.message
            })
        }
    }
    return state
}

function authError(state = false, action: Action) {
    if (action.status && action.status === Status.FAILURE && action.error instanceof NotLoggedInError) {
        return true;
    } else if (action.type === ActionType.CLEAR_LOGIN_SIGNUP 
                || action.type === ActionType.LOGIN
                || action.type === ActionType.PROMPT_MODAL) {
        return false;
    }
    return state;
}

interface WidthRange {
    range: [number, number]
    type: string
}
const WIDTH_RANGES = [
    { range: [0, 501], type: 'small' },
    { range: [501, 801], type: 'medium' },
    { range: [801, 1101], type: 'room-medium' },
    { range: [1101, Infinity], type: 'large' } 
]

function state(state = Map(), action: Action) {
    if (action.type === ActionType.PROMPT_MODAL) {
        return state.set('modal', action.modalType)
    } else if (action.type === ActionType.CLOSE_MODAL) {
        return state.delete('modal')
    } else if (action.type === ActionType.PROMPT_DROPDOWN) {
        // dropdowns is a Set of active dropdowns (as opposed to modal, which tracks a single modal)
        return state.update('dropdowns', Set(), (d: Set<string>) => d.add(action.dropdownType))
    } else if (action.type === ActionType.CLOSE_DROPDOWN) {
        return state.update('dropdowns', Set(), (d: Set<string>) => d.remove(action.dropdownType))
    } else if (action.type === ActionType.SELECT_SIDEBAR) {
        return state.set('overlay', 'sidebar')
    } else if (action.type === ActionType.CLOSE_SIDEBAR) {
        return state.delete('overlay')
    } else if (action.type === ActionType.ADD_SIDEBAR_ANIMATION) {
        return state.set('sidebarAnimating', true)
    } else if (action.type === ActionType.REMOVE_SIDEBAR_ANIMATION) {
        return state.set('sidebarAnimating', false)
    } else if (action.type === ActionType.COLLAPSE_SPLASH_TOPBAR) {
        return state.set('splashTopbarCollapsed', true)
    } else if (action.type === ActionType.EXPAND_SPLASH_TOPBAR) {
        return state.set('splashTopbarCollapsed', false)
    } else if (action.type === ActionType.EXPAND_CHAT) {
        return state.set('overlay', 'chat')
    } else if (action.type === ActionType.COLLAPSE_CHAT) {
        return state.delete('overlay')
    } else if (action.type === ActionType.CLEAR_HOME) {
        return state.set('splashTopbarCollapsed', false)
    } else if (action.type === ActionType.SET_VIDEO_VOLUME) {
        return state.set('volume', action.volume)
    } else if (action.type === ActionType.RESIZE) {
        const width = Math.max(action.width, 0)
        const size = (find(WIDTH_RANGES, (r: WidthRange) => inRange(width, r.range[0], r.range[1])) as any)['type'];
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

function location(state: Location | null = null, action: Action) {
    if (action.type === ActionType.HAS_NAVIGATED) {
        return action.location
    }
    return state
}

const reducers = {
    location,
    tags,
    authError,
    state
}

export default function(state = Map(), action: Action) {
    if (action.type === ActionType.CLEAR_APP) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}