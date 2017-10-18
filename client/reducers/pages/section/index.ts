import { Map } from 'immutable'

import { ActionType, Action } from '@actions/types'
import { 
    State, 
    Reducer, 
    Entity,
    EntityProps,
    combineReducers, 
    entity, 
    paginate 
} from '@reducers/utils'

interface SectionProps extends EntityProps {
    readonly name?: string
    readonly slug?: string
    readonly description?: string
}

type Section = Map<keyof SectionProps, any>

let meta: Reducer<Section> = (state, action) => {
    state = entity(ActionType.Section)(state as Entity, action).delete('id')
    // add extra info to meta state
    if (action.type === ActionType.Section && action.status === "success") {
        return state.merge(action.rawResponse.section)
    }
    return state
}

const pagination = combineReducers({
    stacks: paginate(ActionType.Section)
})

const reducers = {
    meta,
    pagination
}

export default function(state: State, action: Action): State {
    if (action.type === ActionType.ClearSection) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}