import { Map } from 'immutable'
import { ActionType, Action, Status } from '@actions/types'
import { combineReducers } from '@reducers/utils'

import bookmarks from './bookmarks'
import meta from './meta'
import notifications from './notifications'
import stacks from './stacks'
import subscriptions from './subscriptions'

const reducers = {
    meta, 
    notifications,
    stacks,
    bookmarks,
    subscriptions
}

export default function(state = Map(), action: Action) {
    if (action.type === ActionType.LOGOUT && action.status === Status.SUCCESS) {
        return state.delete('meta').delete('bookmarks').delete('subscriptions').delete('notifications')
    } else {
        return combineReducers(reducers)(state, action)
    }
}