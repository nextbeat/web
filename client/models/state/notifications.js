import StateModel from './base'
import { isNumber } from 'lodash'
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

    unreadNotifications() {
        return this.get('unreadNotifications', List())
    }

    readNotifications() {
        return this.get('readNotifications', List())
    }

    allNotifications() {
        return this.get('allNotifications', List())
    }

    // Queries

    unreadMediaItemCount(stack_id) {
        if (!isNumber(stack_id)) {
            stack_id = parseInt(stack_id, 10)
        }

        return this.unreadNotifications().filter(note => 
            note.get('type') === 'new_mediaitem' && note.get('stack_id') === stack_id
        ).size
    }

    totalUnreadCount() {
        return this.unreadNotifications().filter(note =>
            note.get('type') !== 'comments'
        ).size
    }

}