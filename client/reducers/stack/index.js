import { Map, List, Set } from 'immutable'
import { mapValues } from 'lodash'
import { ActionTypes, Status } from '../../actions'

import live from './live'
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

const reducers = {
    meta, 
    pagination,
    mediaItems,
    live,
    ui,
    more
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_STACK) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}