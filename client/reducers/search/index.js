import { Map } from 'immutable'
import { ActionTypes, Status } from '../../actions'
import { combineReducers, entity, paginate } from '../utils'

const initialMetaState = Map({
    searchType: 'stacks'
})

function meta(state=initialMetaState, action) {
    if (action.type === ActionTypes.SEARCH) {
        return state.merge({
            searchType: action.searchType,
            query: action.query
        })
    }
    return state;
}

function pagination(state=Map(), action) {
    if (action.type === ActionTypes.SEARCH) {
        return state.set(action.searchType, paginate(ActionTypes.SEARCH)(state, action))
    }
    return state;
}

const reducers = {
    meta,
    pagination
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_SEARCH) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}