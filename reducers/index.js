import { Map } from 'immutable'
import { mapValues } from 'lodash'
import * as ActionTypes from '../actions'
import { Status } from '../actions'
import paginate from './paginate'
import live from './live'

export function combineReducers(reducers) {
    return function (state = Map(), action) {
        return state.merge(mapValues(reducers, (reducer, key) => reducer(state.get(key), action)));
    }
}

const initialEntities = Map({
    stacks: Map(),
    mediaItems: Map(),
    users: Map(),
    comments: Map()
})

function entities(state = initialEntities, action) {
    if (action.response && action.response.entities) {
        return state.mergeDeep(action.response.entities)
    }
    return state
}

const initialStack = Map({
    isFetching: false,
    error: '',
    id: 0
})

function stack(state = initialStack, action) {
    if (action.type === ActionTypes.STACK) {
        switch (action.status) {
            case Status.REQUESTING:
                return state.merge({
                    isFetching: true,
                    id: action.id
                })
            case Status.SUCCESS:
                return state.merge({
                    isFetching: false
                })
            case Status.FAILURE:
                return state.merge({
                    isFetching: false,
                    error: 'Stack failed to load.'
                })
        }   
    }
    return state;
}

const pagination = combineReducers({
    mediaItems: paginate(ActionTypes.MEDIA_ITEMS),
    comments: paginate(ActionTypes.COMMENTS)
});

function mediaItems(state = Map(), action) {
    if (action.type === ActionTypes.SELECT_MEDIA_ITEM) {
        const selected = state.get('selected', -1);
        return state.set('selected', action.id);
    } 
    return state;
}

export default combineReducers({
    entities,
    stack,
    pagination,
    mediaItems,
    live
})