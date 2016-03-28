import { Map } from 'immutable'
import { ActionTypes, Status } from '../../actions'
import { combineReducers, entity, paginate } from '../utils'

const meta = entity(ActionTypes.TAG);

function stacks(state, action) {
    if (action.type === ActionTypes.CLEAR_TAG_STACKS) {
        return Map()
    } else {
        return paginate(ActionTypes.TAG_STACKS)(state, action)
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
function filters(state = initialFiltersState, action) {
    if (action.type === ActionTypes.TAG_STACKS && action.status === Status.REQUESTING) {
        return state.merge(Map(action.options))
    } 
    return state
}

const reducers = {
    meta,
    pagination,
    filters
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_TAG) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}