import { Map, List, Set } from 'immutable'
import mapValues from 'lodash/mapValues'
import { ActionTypes, Status } from '../../../actions'

import chat from './chat'
import { combineReducers, entity, paginate } from '../../utils'

const meta = entity(ActionTypes.ROOM_PAGE);

function more(state = Map(), action) {
    if (action.type === ActionTypes.MORE_STACKS) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                isFetching: true
            }).delete('error').delete('ids')
        } else if (action.status === Status.SUCCESS) {
            return state.merge({
                isFetching: false,
                ids: action.response.result
            })
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                isFetching: false,
                error: action.error.message
            })
        }
    }
    return state;
}

const initialUIState = Map({ detailSection: 'chat' })
function ui(state = initialUIState, action) {
    if (action.type === ActionTypes.SELECT_DETAIL_SECTION) {
        return state.merge({
            detailSection: action.section
        })
    }
    return state
}

function actions(state = Map(), action) {
    if (action.type === ActionTypes.DELETE_STACK) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                isDeleting: true,
                hasDeleted: false
            }).delete('deleteError')
        } else if (action.status === Status.SUCCESS) {
            return state.merge({
                isDeleting: false,
                hasDeleted: true
            })
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                isDeleting: false,
                hasDeleted: false,
                deleteError: action.error.message
            })
        }
    } else if (action.type === ActionTypes.CLOSE_STACK) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                isClosing: true,
                hasClosed: false
            }).delete('closeError')
        } else if (action.status === Status.SUCCESS) {
            return state.merge({
                isClosing: false,
                hasClosed: true
            })
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                isClosing: false,
                hasClosed: false,
                closeError: action.error.message
            })
        }
    } else if (action.type === ActionTypes.DELETE_MEDIA_ITEM) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                isDeletingMediaItem: true,
                hasDeletedMediaItem: false,
                deletedMediaItemId: action.id
            }).delete('deleteMediaItemError')
        } else if (action.status === Status.SUCCESS) {
            return state.merge({
                isDeletingMediaItem: false,
                hasDeletedMediaItem: true
            })
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                isDeletingMediaItem: false,
                hasDeletedMediaItem: false,
                deleteMediaItemError: action.error.message
            })
        }
    }
    return state
}

function unread(state=Map(), action) {
    if (action.type === ActionTypes.ROOM_PAGE && action.status === Status.SUCCESS) {
        return state.set('count', 0)
    }
    if (action.type === ActionTypes.MEDIA_ITEMS && action.status === Status.SUCCESS) {
        const mostRecentMediaItemId = action.response.result[action.response.result.length-1]
        const mostRecentMediaItem = action.response.entities.mediaItems[mostRecentMediaItemId.toString()]
        return state.set('lastRead', new Date(mostRecentMediaItem.user_created_at))
    }
    if (action.type === ActionTypes.RECEIVE_MEDIA_ITEM) {
        return state.update('count', 0, c => c+1)
    }
    if (action.type === ActionTypes.SELECT_MEDIA_ITEM && 'unreadCount' in action && 'lastRead' in action) {
        return state.merge({
            count: action.unreadCount,
            lastRead: action.lastRead
        })
    }
    if (action.type === ActionTypes.RECEIVE_ROOM_MARKED) {
        return state.merge({
            count: action.unreadCount,
            lastRead: action.lastRead
        })
    }
    return state;
}

const reducers = {
    meta, 
    chat,
    ui,
    more,
    actions,
    unread
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_ROOM_PAGE) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}