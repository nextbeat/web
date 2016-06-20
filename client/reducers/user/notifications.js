import { Map, Set, Iterable, fromJS } from 'immutable'
import { ActionTypes, Status } from '../../actions'

const initialState = {
    unread: Map(),
    read: Map()
}

function unreadReviver(key, value) {
    return Iterable.isIndexed(value) ? value.toSet() : value.toMap();
}

function syncNotifications(state, action) {
    if (action.status === Status.SUCCESS) {
        return state.merge({
            unread: fromJS(action.response, unreadReviver),
            read: Map()
        });
    }
    return state;
}

function markAsRead(state, action) {
    if (action.stack) {
        // only handles new_mediaitem key for now
        if (state.getIn(['unread', 'new_mediaitem'], Set()).has(action.stack)) {
            return state
                .updateIn(['unread', 'new_mediaitem'], Set(), stacks => stacks.filter(s => s !== action.stack))
                .updateIn(['read', 'new_mediaitem'], Set(), stacks => stacks.add(action.stack))
        }
    }
    return state;
}

export default function notifications(state=initialState, action) {
    switch (action.type) {
        case ActionTypes.SYNC_NOTIFICATIONS:
            return syncNotifications(state, action);
        case ActionTypes.MARK_AS_READ: 
            return markAsRead(state, action);
    }
    return state;
}