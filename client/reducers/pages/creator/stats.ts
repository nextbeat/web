import { Map } from 'immutable'

import { ActionType, Action } from '@actions/types'
import { entity, combineReducers } from '@reducers/utils'
import { State } from '@types'

const reducers = {
    user: entity(ActionType.STATS),
    room: entity(ActionType.ROOM_STATS)
}

export default function(state = Map<string, any>(), action: Action) {
    if (action.type === ActionType.CLEAR_STATS) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}