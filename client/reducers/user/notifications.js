import { Map, Set, Iterable, fromJS } from 'immutable'
import { ActionTypes, Status } from '../../actions'

const initialState = {
    unread: Map(),
    read: Map()
}

function transform(response) {
    let unread = fromJS(response)
    for (var key of unread.keys()) {
        unread = unread.update(key, v => {
            let notes = Set()
            v.forEach( note => {
                notes = notes.add(Map({
                    stack: note.get(0),
                    count: note.get(1, 1)
                }))
            })
            return notes
        })
    }
    return unread
}

function syncUnreadNotifications(state, action) {
    if (action.status === Status.SUCCESS) {
        return state.merge({
            unread: transform(action.response),
            read: Map()
        });
    }
    return state;
}

function markAsRead(state, action) {
    if (action.stack) {
        // only handles new_mediaitem key for now
        var id = parseInt(action.stack, 10)
        let note = state.getIn(['unread', 'new_mediaitem'], Set()).find(note => note.get('stack') === id)
        if (!!note) {
            return state
                .updateIn(['unread', 'new_mediaitem'], Set(), notes => notes.delete(note))
                .updateIn(['read', 'new_mediaitem'], Set(), notes => notes.add(note))
        }
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
        case ActionTypes.SYNC_NOTIFICATIONS:
            return syncUnreadNotifications(state, action);
        case ActionTypes.MARK_AS_READ: 
            return markAsRead(state, action);
        case ActionTypes.NOTIFICATIONS:
            return loadNotifications(state, action)
        case ActionTypes.CLEAR_NOTIFICATIONS:
            return state.delete('all').delete('isFetching').delete('error')
    }
    return state;
}