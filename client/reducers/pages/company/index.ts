import { Map, fromJS } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { combineReducers } from '@reducers/utils'
import { State } from '@types'

function submitContactMessage(state: State, action: Action) {
    if (action.status === Status.REQUESTING) {
        return state.mergeIn(['contact'], {
            isSubmitting: true,
            hasSubmitted: false
        }).deleteIn(['contact', 'error'])
    } else if (action.status === Status.SUCCESS) {
        return state.mergeIn(['contact'], {
            isSubmitting: false,
            hasSubmitted: true
        })
    } else if (action.status === Status.FAILURE) {
        return state.mergeIn(['contact'], {
            isSubmitting: false,
            error: 'Unable to submit message.'
        })
    }
    return state
}

export default function(state = Map<string, any>(), action: Action) {
    if (action.type === ActionType.CLEAR_COMPANY) {
        return Map()
    } else if (action.type === ActionType.SUBMIT_CONTACT_MESSAGE) {
       return submitContactMessage(state, action)
    }
    return state
}