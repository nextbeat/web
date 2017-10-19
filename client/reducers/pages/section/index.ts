import { Map } from 'immutable'

import { ActionType, Action } from '@actions/types'
import { State, Reducer } from '@types'
import { 
    combineReducers, 
    entity, 
    paginate 
} from '@reducers/utils'


let meta: Reducer = (state, action) => {
    state = entity(ActionType.SECTION)(state, action).delete('id')
    // add extra info to meta state
    if (action.type === ActionType.SECTION && action.status === "success") {
        return state.merge(action.rawResponse.section)
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