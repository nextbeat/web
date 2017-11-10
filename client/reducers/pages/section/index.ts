import { Map } from 'immutable'

import { ActionType, Action, Status } from '@actions/types'
import { State, Reducer } from '@types'
import { 
    combineReducers, 
    entity, 
    paginate 
} from '@reducers/utils'


function meta(state: State, action: Action) {
    state = entity(ActionType.SECTION)(state, action).delete('id')
    // add extra info to meta state
    if (action.type === ActionType.SECTION && action.status === Status.SUCCESS) {
        return state.merge((action.rawResponse as any).section)
    }
    return state
}

const pagination = combineReducers({
    stacks: paginate(ActionType.SECTION)
})

const reducers = {
    meta,
    pagination
}

export default function(state: State, action: Action): State {
    if (action.type === ActionType.CLEAR_SECTION) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}