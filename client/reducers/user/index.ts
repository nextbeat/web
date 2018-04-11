import { Map } from 'immutable'
import { ActionType, Action, Status } from '@actions/types'
import { combineReducers } from '@reducers/utils'

import bookmarks from './bookmarks'
import meta from './meta'
import notifications from './notifications'
import social from './social'
import stacks from './stacks'
import subscriptions from './subscriptions'

const reducers = {
    meta, 
    notifications,
    stacks,
    bookmarks,
    subscriptions,
    social
}

export default function(state = Map(), action: Action) {
    if (action.type === ActionType.LOGOUT && action.status === Status.SUCCESS) {
        return state.deleteAll(['meta', 'bookmarks', 'subscriptions', 'notifications', 'social'])
    } else {
        return combineReducers(reducers)(state, action)
    }
}