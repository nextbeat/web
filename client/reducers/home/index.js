import { Map, List, fromJS } from 'immutable'
import { ActionTypes, Status } from '../../actions'
import { combineReducers } from '../utils'

function normalizedSections(sections) {
    return fromJS(sections).map(section => section.update('stacks', stacks => stacks.map(stack => stack.get('id'))))
}

function sections(state, action) {
    if (action.type === ActionTypes.HOME) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                isFetching: true
            }).delete('sections').delete('error')
        } else if (action.status === Status.SUCCESS) {
            return state.merge({
                isFetching: false,
                sections: normalizedSections(action.response)
            })
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                isFetching: false,
                error: action.error
            })
        }
    }
    return state;
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_HOME) {
        return Map()
    } else {
        return sections(state, action)
    }
}