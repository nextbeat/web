import { Map } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { combineReducers, entity, paginate } from '@reducers/utils'

const meta = entity(ActionType.USER);

const pagination = combineReducers({
    stacks: paginate(ActionType.USER_STACKS)
})

const reducers = {
    meta,
    pagination
}

export default function(state = Map<string, any>(), action: Action) {
    if (action.type === ActionType.CLEAR_PROFILE) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}