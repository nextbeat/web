import { Map, Set, List, Iterable, fromJS } from 'immutable'
import { ActionTypes, Status } from '../../actions'

function loadActivity(state, action) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            isFetching: true
        }).delete('activity').delete('error')
    } else if (action.status === Status.SUCCESS) {
        return state.merge({
            isFetching: false,
            activity: action.response,
            unreadCount: 0
        })
    } else if (action.status === Status.FAILURE) {
        return state.merge({
            isFetching: false,
            error: action.error.message
        })
    }
    return state;
}

function clearNotifications(state, action) {
    return state
        .delete('activity')
        .delete('isFetching')
        .delete('error');
}

function login(state, action) {
    if (action.status === Status.SUCCESS) {
        return state.merge({
            unreadCount: action.user.unread_count
        });
    }
    return state;
}

function receiveActivityEvent(state, action) {
    return state.update('unreadCount', 0, count => count+1);
}

export default function notifications(state=Map(), action) {
    switch (action.type) {
        case ActionTypes.ACTIVITY:
            return loadActivity(state, action);
        case ActionTypes.LOGIN:
            return login(state, action);
        case ActionTypes.RECEIVE_ACTIVITY_EVENT:
            return receiveActivityEvent(state, action);
        case ActionTypes.CLEAR_NOTIFICATIONS:
            return clearNotifications(state, action)
    }
    return state;
}