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
    chat,
    ui,
    more,
    actions
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_ROOM_PAGE) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}