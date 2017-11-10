import { Map, fromJS } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { combineReducers, entity, paginate } from '../../utils'

const initialMetaState = fromJS({
    searchType: 'stacks'
})

function meta(state=initialMetaState, action: Action) {
    if (action.type === ActionType.SEARCH) {
        return state.merge({
            searchType: action.searchType,
            query: action.query
        })
    }
    return state;
}

function pagination(state=Map<string, any>(), action: Action) {
    if (action.type === ActionType.SEARCH) {
        return state.set(action.searchType, paginate(ActionType.SEARCH)(state, action))
    }
    return state;
}

const reducers = {
    meta,
    pagination
}

export default function(state = Map<string, any>(), action: Action) {
    if (action.type === ActionType.CLEAR_SEARCH) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}