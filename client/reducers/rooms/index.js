import { Map } from 'immutable'
import isNumber from 'lodash/isNumber'
import { ActionTypes } from '../../actions'

import live from './live'
import navigation from './navigation'
import { combineReducers, entity, paginate } from '../utils'

let meta = entity(ActionTypes.ROOM)

function mediaItems(state, action) {
    if (action.type === ActionTypes.DELETE_MEDIA_ITEM) {
        if (state.get('ids').includes(action.id)) {
            state = state
                .update('total', total => total-1)
                .update('ids', ids => ids.filter(id => id !== action.id))
        }
        return state
    } else {
        return paginate(ActionTypes.MEDIA_ITEMS)(state, action)
    }
}

let pagination = combineReducers({
    mediaItems,
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