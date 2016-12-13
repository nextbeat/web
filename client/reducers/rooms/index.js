import { Map } from 'immutable'
import { isNumber } from 'lodash'
import { ActionTypes } from '../../actions'

import live from './live'
import navigation from './navigation'
import { combineReducers, entity, paginate } from '../utils'

let meta = entity(ActionTypes.ROOM)

let pagination = combineReducers({
    mediaItems: paginate(ActionTypes.MEDIA_ITEMS),
    comments: paginate(ActionTypes.COMMENTS, ActionTypes.CLEAR_COMMENTS)
});

let roomReducer = combineReducers({
    meta,
    pagination,
    live,
    navigation
})

// Maintains object where keys are room ids and values
// are state dealing with that room. Allows for multiple
// rooms at a time.
export default function (state = Map(), action) {
    if (typeof action.roomId === 'undefined') {
        return state
    }

    if (!isNumber(action.roomId)) {
        action.roomId = parseInt(action.roomId, 10)
    }

    if (action.type === ActionTypes.CLEAR_ROOM) {
        return state.delete(action.roomId)
    } else {
        return state.update(action.roomId, Map(), roomState => roomReducer(roomState, action))
    }
}