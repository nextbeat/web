import { Map, fromJS } from 'immutable'
import { ActionType, Action, Status } from '@actions/types'

export default function ads(state = Map(), action: Action) {
    if (action.type === ActionType.ROOM_ADS) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                isFetching: true,
                hasFetched: false
            }).delete('ids').delete('error')
        } else if (action.status === Status.SUCCESS && action.response) {
            return state.merge({
                isFetching: false,
                hasFetched: true,
                ids: fromJS(action.response.result)
            })
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                isFetching: false,
                error: action.error
            })
        }
    } else if (action.type === ActionType.PLAYBACK_DID_END && action.itemType === 'ad') {
        return state.merge({
            hasPlayedPrerollAd: true 
        })
    } else if (action.type === ActionType.ROOM) {
        return state.merge({
            shouldSkip: action.options.skipAds
        })
    }
    return state
}