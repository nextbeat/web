import { Map, Set, List, Iterable, fromJS } from 'immutable'
import { ActionTypes, Status } from '../../actions'

const initialState = {
    unread: List(),
    read: List()
}

function syncUnreadNotifications(state, action) {
    if (action.status === Status.SUCCESS) {
        return state.merge({
            unread: fromJS(action.response),
            read: List()
        });
    }
    return state;
}

function markAllAsRead(state, action) {
    return state.merge({
        unread: List(),
        read: state.get('unread')
    });
}

function markAsRead(state, action) {
    if (action.stack) {
        var id = parseInt(action.stack, 10)
        return state.merge({
            unread: state.get('unread').filterNot(note => note.get('stack_id') === id),
            read: state.get('unread').filter(note => note.get('stack_id') === id)
        });
    }
    return state;
}

function loadNotifications(state, action) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            isFetching: true
        }).delete('all').delete('error')
    } else if (action.status === Status.SUCCESS) {
        return state.merge({
            isFetching: false,
            all: action.response
        })
    } else if (action.status === Status.FAILURE) {
        return state.merge({
            isFetching: false,
            error: action.error
        })
    }
    return state;
}

export default function notifications(state=initialState, action) {
    switch (action.type) {
        case ActionTypes.SYNC_UNREAD_NOTIFICATIONS:
            return syncUnreadNotifications(state, action);
        case ActionTypes.MARK_AS_READ: 
            return markAsRead(state, action);
        case ActionTypes.MARK_ALL_AS_READ:
            return markAllAsRead(state, action);
        case ActionTypes.NOTIFICATIONS:
            return loadNotifications(state, action)
        case ActionTypes.CLEAR_NOTIFICATIONS:
            return state.delete('all').delete('isFetching').delete('error')
    }
    return state;
}