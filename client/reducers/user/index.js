import { Map, List } from 'immutable'
import { isArray } from 'lodash'
import { ActionTypes, Status } from '../../actions'
import live from './live'
import notifications from './notifications'
import { combineReducers, paginate } from '../utils'

function meta(state=Map(), action) {
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
                    token: action.user.token,
                    uuid: action.user.uuid
                })
            case Status.FAILURE:
                return state.merge({
                    isLoggingIn: false,
                    loginError: action.error
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
    } else if (action.type === ActionTypes.SIGNUP) {
        switch (action.status) {
            case Status.REQUESTING:
                return state.merge({
                    isSigningUp: true
                })
            case Status.SUCCESS:
                return state.merge({
                    isSigningUp: false
                })
            case Status.FAILURE:
                return state.merge({
                    isSigningUp: false,
                    signupError: action.error
                })
        }
    } else if (action.type === ActionTypes.CLEAR_LOGIN_SIGNUP) {
        return state.merge({
            isSigningUp: false,
            isLoggingIn: false
        }).delete('loginError').delete('signupError');
    }
    return state;
}

// used for both bookmarks and subscriptions
function userItems(types, state=Map(), action) {
    // types is an array which contains the fetch action, the do action, and the undo action
    if (!(isArray(types) && types.length === 3)) {
        throw new Error("Types array must be of length 3.")
    }

    if (action.type === types[0] && action.status === Status.SUCCESS) {

        state = paginate(types[0])(state, action)
        // We don't need (or want) the usual pagination metadata here
        return state.delete('beforeDate').delete('limit').delete('page').delete('total');

    } else if (action.type === types[1] && action.status === Status.SUCCESS) {

        if (state.get('ids', List()).includes(action.id)) {
            return state;
        }
        return state.update('ids', List(), ids => ids.unshift(action.id));

    } else if (action.type === types[2] && action.status === Status.SUCCESS) {

        const index = state.get('ids', List()).indexOf(action.id);
        if (index === -1) {
            return state;
        }
        return state.update('ids', List(), ids => ids.delete(index));

    }
    return state;
}

const bookmarkedStacks = userItems.bind(this, [ActionTypes.BOOKMARKED_STACKS, ActionTypes.BOOKMARK, ActionTypes.UNBOOKMARK])
const subscriptions = userItems.bind(this, [ActionTypes.SUBSCRIPTIONS, ActionTypes.SUBSCRIBE, ActionTypes.UNSUBSCRIBE])

const reducers = {
    meta, 
    live,
    notifications,
    bookmarkedStacks,
    subscriptions
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.LOGOUT && action.status === Status.SUCCESS) {
        return state.delete('meta').delete('bookmarkedStacks').delete('subscriptions')
    } else {
        return combineReducers(reducers)(state, action)
    }
}