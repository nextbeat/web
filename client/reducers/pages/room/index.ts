import { Map, List, Set, fromJS } from 'immutable'
import mapValues from 'lodash-es/mapValues'
import { ActionType, Status, Action } from '@actions/types'
import { combineReducers, entity, paginate } from '@reducers/utils'
import { State } from '@types'

import chat from './chat'
import shop from './shop'

const meta = entity(ActionType.ROOM_PAGE);

const initialUIState = fromJS({ detailSection: 'chat' })
function ui(state = initialUIState, action: Action) {
    if (action.type === ActionType.SELECT_DETAIL_SECTION) {
        return state.merge({
            detailSection: action.section
        })
    }
    return state
}

function actions(state = Map<string, any>(), action: Action) {
    if (action.type === ActionType.DELETE_STACK) {
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
    } else if (action.type === ActionType.CLOSE_STACK) {
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
    } else if (action.type === ActionType.DELETE_MEDIA_ITEM) {
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
                deleteMediaItemError: action.error.message || "Error"
            })
        }
    } else if (action.type === ActionType.EDIT_MEDIA_ITEM_TITLE) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                isEditingMediaItemTitle: true,
                hasEditedMediaItemTitle: false,
                editedMediaItemId: action.id 
            }).deleteAll('editMediaItemTitleError')
        } else if (action.status === Status.SUCCESS) {
            return state.merge({
                isEditingMediaItemTitle: false,
                hasEditedMediaItemTitle: true
            })
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                isEditingMediaItemTitle: false,
                hasEditedMediaItemTitle: false,
                editMediaItemTitleError: action.error.message || "Error"
            })
        }
    }
    return state
}

function unread(state=Map<string, any>(), action: Action) {
    if (action.type === ActionType.ROOM_PAGE && action.status === Status.SUCCESS) {
        return state.set('count', 0)
    }
    if (action.type === ActionType.MEDIA_ITEMS && action.status === Status.SUCCESS && action.response) {
        const mostRecentMediaItemId = action.response.result[action.response.result.length-1]
        const mostRecentMediaItem = action.response.entities.mediaItems[mostRecentMediaItemId.toString()]
        return state.set('lastRead', new Date(mostRecentMediaItem.user_created_at))
    }
    if (action.type === ActionType.RECEIVE_MEDIA_ITEM) {
        return state.update('count', 0, (c: number) => c+1)
    }
    if (action.type === ActionType.SELECT_MEDIA_ITEM && 'unreadCount' in action && 'lastRead' in action) {
        return state.merge({
            count: action.unreadCount,
            lastRead: action.lastRead
        })
    }
    if (action.type === ActionType.RECEIVE_ROOM_MARKED) {
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
    shop,
    ui,
    actions,
    unread
}

export default function(state = Map<string, any>(), action: Action) {
    if (action.type === ActionType.CLEAR_ROOM_PAGE) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}