import { Map, List } from 'immutable'
import isNumber from 'lodash/isNumber'
import { ActionTypes, Status } from '../../actions'

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

function _isLatestCommentInResult(state, action) {
      const latestCommentId = state.get('latestIds', List()).first() || -1
      return List(action.response.result).findIndex(id => id === latestCommentId) > -1
}

function comments(state=Map(), action) {
    if (action.type === ActionTypes.COMMENTS) {
        if (action.status === Status.REQUESTING) {
            state = state.merge({
                isFetching: true,
                fetchType: action.fetchType
            }).delete('error')
            // If we're reloading the most recent comments
            // or jumping to a comment from a search result,
            // we want to flush any currently present comments.
            if (action.fetchType === 'mostRecent' || action.fetchType === 'around') {
                state = state.merge({
                    ids: List(),
                    hasReachedLatest: false
                })
            }
        } else if (action.status === Status.SUCCESS) {
            state = state.merge({
                isFetching: false,
                hasFetched: true
            })
            if (action.fetchType === 'mostRecent') {
                const hasReachedOldest = action.response.result.size < action.response.limit
                return state.merge({
                    ids: List(action.response.result),
                    latestIds: List(action.response.result).slice(0, 5),
                    hasReachedLatest: true,
                    hasReachedOldest
                })
            } else if (action.fetchType === 'around') {
                // Note that below condition is sufficient but not
                // necessary to have reached the oldest comment;
                // if the client HAS loaded the oldest comment and
                // fetched the limit though, if older comments are requested
                // 0 will be returned and hasReachedOldest will be triggered.
                const hasReachedOldest = action.response.result.size < action.response.limit
                const hasReachedLatest = hasReachedOldest || _isLatestCommentInResult(state, action)
                return state.merge({
                    ids: List(action.response.result),
                    hasReachedOldest,
                    hasReachedLatest
                })
            } else if (action.fetchType === 'before') {
                if (action.response.result.length < action.response.limit) {
                    state = state.set('hasReachedOldest', true)
                }
                state = state.update('ids', List(), ids => ids.concat(List(action.response.result)))
            } else if (action.fetchType === 'after') {
                let resultIds = List(action.response.result)
                // If the lastest loaded id is in the
                // list of results, we've reached the
                // end of the loaded comments. Anything past
                // that is a live comment the client has
                // already received, so we throw it out.
                const latestCommentId = state.get('latestIds', List()).first() || -1
                if (_isLatestCommentInResult(state, action)) {
                    state = state.set('hasReachedLatest', true)
                    resultIds = resultIds.filter(id => id <= latestCommentId);
                }
                state = state.update('ids', List(), ids => resultIds.concat(ids))
            }
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                isFetching: false,
                error: 'Failed to load.'
            })
        }
    }
    return state
}

let pagination = combineReducers({
    mediaItems,
    comments
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