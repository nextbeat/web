import { Map } from 'immutable'
import { ActionTypes, Status } from '../../../actions'
import { combineReducers, entity, paginate } from '../../utils'

function meta(state, action) {
    state = entity(ActionTypes.SECTION)(state, action).delete('id')
    // add extra info to meta state
    if (action.type === ActionTypes.SECTION && action.status === Status.SUCCESS) {
        return state.merge(action.rawResponse.section)
    }
    return state
}


const pagination = combineReducers({
    stacks: paginate(ActionTypes.SECTION)
})


const reducers = {
    meta,
    pagination
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_SECTION) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}