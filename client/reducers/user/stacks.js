import { Map, List } from 'immutable'
import filter from 'lodash/filter'
import difference from 'lodash/difference'

import { ActionTypes, Status } from '../../actions'

const initialState = Map({
    openStacks: List(),
    closedStacks: List()
})

function openStackIds(response) {
    return filter(response.result, id => !response.entities.stacks[id].closed)
}

export default function stacks(state=Map(), action) {
    if (action.type === ActionTypes.SYNC_STACKS) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                isFetching: true
            })
        } else if (action.status === Status.SUCCESS) {
            // todo: merge stack ids
            return state.merge({
                isFetching: false,
                openStackIds: openStackIds(action.response),
                closedStackIds: difference(action.response.result, openStackIds(action.response))
            })
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                isFetching: false
            })
        }
    }
    return state
}