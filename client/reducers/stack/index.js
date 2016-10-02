import { Map, List, Set } from 'immutable'
import { mapValues } from 'lodash'
import { ActionTypes, Status } from '../../actions'

import live from './live'
import chat from './chat'
import { combineReducers, entity, paginate } from '../utils'

const meta = entity(ActionTypes.STACK);

const pagination = combineReducers({
    mediaItems: paginate(ActionTypes.MEDIA_ITEMS),
    comments: paginate(ActionTypes.COMMENTS)
});

function mediaItems(state = Map(), action) {
    if (action.type === ActionTypes.SELECT_MEDIA_ITEM) {
        return state
            .set('selected', action.id)
            .update('seen', Set(), v => v.add(action.id))
    }
    return state;
}

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
                error: action.error
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
                deleteError: action.error
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
                closeError: action.error
            })
        }
    }
    return state
}

const reducers = {
    meta, 
    pagination,
    mediaItems,
    live,
    chat,
    ui,
    more,
    actions
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_STACK) {
        return Map()
    } else if (action.type === ActionTypes.CLEAR_COMMENTS) {
        return state.deleteIn(['pagination', 'comments']).deleteIn(['live', 'comments'])
    } else {
        return combineReducers(reducers)(state, action)
    }
}