import { Map, List } from 'immutable'
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
        return state.set('selected', action.id);
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
            // 7 ids are returned; we need to cut out the loaded stack id, 
            // if it's in the list, or the last one
            const ids = List(action.response.result).filter(id => id !== action.stack_id).take(6)
            return state.merge({
                isFetching: false,
                ids: ids
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

const reducers = {
    meta, 
    pagination,
    mediaItems,
    live,
    more
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_STACK) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}