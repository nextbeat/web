import { Map } from 'immutable'
import { mapValues } from 'lodash'
import * as ActionTypes from '../../actions'
import { Status } from '../../actions'

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

const reducers = {
    meta, 
    pagination,
    mediaItems,
    live
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_STACK) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}