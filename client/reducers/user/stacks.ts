import { Map, List } from 'immutable'
import filter from 'lodash-es/filter'
import difference from 'lodash-es/difference'

import { ActionType, Status, Action } from '@actions/types'

function openStackIds(response: any) {
    return filter(response.result, id => !response.entities.stacks[id].closed)
}

export default function stacks(state=Map<string, any>(), action: Action) {
    if (action.type === ActionType.SYNC_STACKS) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                isFetching: true
            })
        } else if (action.status === Status.SUCCESS) {
            // todo: merge stack ids
            return state.merge({
                isFetching: false,
                openStackIds: openStackIds(action.response),
                closedStackIds: difference((action.response as any).result, openStackIds(action.response))
            })
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                isFetching: false
            })
        }
    }
    return state
}