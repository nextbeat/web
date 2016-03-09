import { Map } from 'immutable'
import { ActionTypes, Status } from '../../actions'
import { combineReducers, entity, paginate } from '../utils'

const meta = entity(ActionTypes.CHANNEL);

function stacks(state, action) {
    if (action.type === ActionTypes.CLEAR_CHANNEL_STACKS) {
        return Map()
    } else {
        return paginate(ActionTypes.CHANNEL_STACKS)(state, action)
    }
}

const pagination = combineReducers({
    stacks
})

const initialFiltersState = Map({
    status: "all",
    sort: "hot"
})
function filters(state = initialFiltersState, action) {
    if (action.type === ActionTypes.CHANNEL_STACKS && action.status === Status.REQUESTING) {
        return state.merge({
            status: action.status,
            sort: action.sort
        })
    } 
    return state
}

const reducers = {
    meta,
    pagination,
    filters
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_CHANNEL) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}