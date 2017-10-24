import { Map, fromJS } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { combineReducers, entity, paginate } from '@reducers/utils'
import { State } from '@types'

const meta = entity(ActionType.TAG);

function stacks(state: State, action: Action) {
    if (action.type === ActionType.CLEAR_TAG_STACKS) {
        return Map()
    } else {
        return paginate(ActionType.TAG_STACKS)(state, action)
    }
}

const pagination = combineReducers({
    stacks
})

const initialFiltersState = Map({
    time: "all",
    status: "all",
    sort: "hot"
})
function filters(state = initialFiltersState, action: Action) {
    if (action.type === ActionType.TAG_STACKS && action.status === Status.REQUESTING) {
        return state.merge(fromJS(action.options))
    } 
    return state
}

const reducers = {
    meta,
    pagination,
    filters
}

export default function(state = Map<string, any>(), action: Action) {
    if (action.type === ActionType.CLEAR_TAG) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}