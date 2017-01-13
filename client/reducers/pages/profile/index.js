import { Map } from 'immutable'
import { ActionTypes, Status } from '../../../actions'
import { combineReducers, entity, paginate } from '../../utils'

const meta = entity(ActionTypes.USER);

const pagination = combineReducers({
    stacks: paginate(ActionTypes.USER_STACKS)
})

const reducers = {
    meta,
    pagination
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_PROFILE) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}