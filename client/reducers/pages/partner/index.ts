import { Map, fromJS } from 'immutable'
import { Action, ActionType, Status } from '@actions/types'
import { combineReducers, entity } from '@reducers/utils'
import { State } from '@types'

function meta(state: State = Map(), action: Action) {
    if (action.type === ActionType.PARTNER) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                isFetching: true,
                hasFetched: false 
            })
            .delete('error')
            .delete('campaignIds')
        } else if (action.status === Status.SUCCESS && action.response) {
            return state.merge({
                isFetching: false,
                hasFetched: true,
                campaignIds: action.response.result
            })
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                isFetching: false,
                hasFetched: false,
                error: action.error
            })
        }
    }
    return state
}

function campaign(state: State = Map(), action: Action) {
    if (action.type === ActionType.CAMPAIGN) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                isFetching: true,
                hasFetched: false 
            })
            .delete('error').delete('id').delete('stackIds')
        } else if (action.status === Status.SUCCESS && action.rawResponse) {
            return state.merge({
                isFetching: false,
                hasFetched: true,
                id: action.rawResponse.id,
                stackIds: fromJS(action.rawResponse.stacks.map((s: any) => s.id))
            })
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                isFetching: false,
                hasFetched: false,
                error: action.error
            })
        }
    } else if (action.type === ActionType.CAMPAIGN_ROOM) {
        return state.merge({
            room: entity(ActionType.CAMPAIGN_ROOM)(state, action)
        })
    }
}

export default function(state: State = Map(), action: Action) {
    if (action.type === ActionType.CLEAR_PARTNER) {
        return Map()
    } else {
        return combineReducers({ meta, campaign })
    }
}