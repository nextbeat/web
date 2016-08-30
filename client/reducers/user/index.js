import { Map } from 'immutable'
import { ActionTypes, Status } from '../../actions'
import { combineReducers } from '../utils'

import bookmarks from './bookmarks'
import live from './live'
import meta from './meta'
import notifications from './notifications'
import stacks from './stacks'
import subscriptions from './subscriptions'

const reducers = {
    meta, 
    live,
    notifications,
    stacks,
    bookmarks,
    subscriptions
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.LOGOUT && action.status === Status.SUCCESS) {
        return state.delete('meta').delete('bookmarks').delete('subscriptions')
    } else {
        return combineReducers(reducers)(state, action)
    }
}