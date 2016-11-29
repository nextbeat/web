import StateModel from './base'
import { Map, Set, List } from 'immutable'

const KEY_MAP = {
    // notifications
    'unreadNotifications': ['user', 'notifications', 'unread'],
    'readNotifications': ['user', 'notifications', 'read'],
    'allNotifications': ['user', 'notifications', 'all'],
    'isFetching': ['user', 'notifications', 'isFetching'],
    'error': ['user', 'notifications', 'error'],
    'isSyncingUnread': ['user', 'notifications', 'isSyncingUnread']
}

export default class Notifications extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
    }

    // note: next two methods only factor new_mediaitem notifications
    // we'll need to refactor when we add more notification types
    unreadCountForStack(id) {
        id = parseInt(id, 10)
        var note = this.get('unreadNotifications', Map()).get('new_mediaitem', Set()).find(note => note.get('stack') === id)
        return note ? note.get('count', 1) : 0;
    }

    totalUnreadCount(open=false) {
        let notes = this.get('unreadNotifications', Map()).get('new_mediaitem', Set())

        if (open) {
            // return only notifications for open stacks
            const openBookmarkIds = this.get('openBookmarkIds', List())
            notes = notes.filter(note => openBookmarkIds.includes(note.get('stack')))
        }
        
        return notes.reduce((total, note) => total + note.get('count', 1), 0)
        
    }

    // Serialization

    readNotificationsJSON() {
        let response = {}
        const read = this.get('readNotifications', Map())
        for (var key of read.keys()) {
            let notes = []
            read.get(key).forEach(note => {
                notes.push([note.get('stack'), note.get('count', 1)])
            })
            response[key] = notes
        }
        return response
    }

}