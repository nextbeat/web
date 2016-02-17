import { Map } from 'immutable'
import { mapValues } from 'lodash'
import * as ActionTypes from '../actions'
import { Status } from '../actions'
import entity from './entity'
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

const stack = entity(ActionTypes.STACK, ActionTypes.CLEAR_STACK);
const profile = entity(ActionTypes.USER, ActionTypes.CLEAR_PROFILE);

const pagination = combineReducers({
    mediaItems: paginate(ActionTypes.MEDIA_ITEMS, ActionTypes.CLEAR_STACK),
    comments: paginate(ActionTypes.COMMENTS, ActionTypes.CLEAR_STACK),
    stacks: paginate(ActionTypes.USER_STACKS, ActionTypes.CLEAR_PROFILE)
});

function mediaItems(state = Map(), action) {
    if (action.type === ActionTypes.SELECT_MEDIA_ITEM) {
        return state.set('selected', action.id);
    } 
    return state;
}

function user(state=Map(), action) {
    if (action.type === ActionTypes.LOGIN) {
        switch (action.status) {
            case Status.REQUESTING:
                return state.merge({
                    isLoggingIn: true
                })
            case Status.SUCCESS:
                return state.merge({
                    isLoggingIn: false,
                    id: action.user.id,
                    username: action.user.username,
                    token: action.user.token
                })
            case Status.FAILURE:
                return state.merge({
                    isLoggingIn: false,
                    error: action.error
                })
        }
    } else if (action.type === ActionTypes.LOGOUT) {
        switch (action.status) {
            case Status.REQUESTING:
                return state.merge({
                    isLoggingOut: true
                })
            case Status.SUCCESS:
                return state.set('isLoggingOut', false)
                    .delete('id')
                    .delete('token')
                    .delete('username');
            case Status.FAILURE:
                return state.merge({
                    isLoggingOut: false
                })
        }
    }
    return state;
}

export default combineReducers({
    entities,
    stack,
    profile,
    pagination,
    mediaItems,
    live,
    user
})