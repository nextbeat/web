import { Map, Set, List } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { ActivityAction, ClearNotificationsAction } from '@actions/notifications'
import { LoginAction } from '@actions/user'
import { ReceiveActivityEventAction } from '@actions/eddy'
import { State } from '@types'

function loadActivity(state: State, action: ActivityAction) {
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

function clearNotifications(state: State, action: ClearNotificationsAction) {
    return state
        .delete('activity')
        .delete('isFetching')
        .delete('error');
}

function login(state: State, action: LoginAction) {
    if (action.status === Status.SUCCESS) {
        return state.merge({
            unreadCount: action.user.unread_count
        });
    }
    return state;
}

function receiveActivityEvent(state: State, action: ReceiveActivityEventAction) {
    return state.update('unreadCount', 0, count => count+1);
}

export default function notifications(state=Map<string, any>(), action: Action) {
    switch (action.type) {
        case ActionType.ACTIVITY:
            return loadActivity(state, action);
        case ActionType.LOGIN:
            return login(state, action);
        case ActionType.RECEIVE_ACTIVITY_EVENT:
            return receiveActivityEvent(state, action);
        case ActionType.CLEAR_NOTIFICATIONS:
            return clearNotifications(state, action)
    }
    return state;
}