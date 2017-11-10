import { Map, List, fromJS } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { HomeAction } from '@actions/pages/home'
import { combineReducers } from '@reducers/utils'
import { State } from '@types'

function normalizedSections(sections: any[]) {
    return fromJS(sections).map((section: State) => section.update('stacks', stacks => stacks.map((stack: State) => stack.get('id'))))
}

function home(state: State, action: HomeAction) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            isFetching: true
        }).delete('sections').delete('error')
    } else if (action.status === Status.SUCCESS && action.response) {
        return state.merge({
            isFetching: false,
            sections: normalizedSections((action.response as any).sections),
            mainCardId: (action.response as any).main_card.id
        })
    } else if (action.status === Status.FAILURE) {
        return state.merge({
            isFetching: false,
            error: action.error.message
        })
    }
    return state
}

export default function(state = Map<string, any>(), action: Action) {
    if (action.type === ActionType.CLEAR_HOME) {
        return Map()
    } else if (action.type === ActionType.HOME) {
        return home(state, action)
    }
    return state
}