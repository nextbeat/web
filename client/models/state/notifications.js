import StateModel from './base'
import isNumber from 'lodash/isNumber'
import { Map, Set, List } from 'immutable'

const KEY_MAP = {
    // notifications
    'activity': ['activity'],
    'unreadNotifications': ['unread'],
    'readNotifications': ['read'],
    'isFetching': ['isFetching'],
    'error': ['error'],
    'isSyncingUnread': ['isSyncingUnread'],
    'unreadCount': ['unreadCount']
}

export default class Notifications extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['user', 'notifications'];
    }

    unreadNotifications() {
        return this.get('unreadNotifications', List())
    }

    readNotifications() {
        return this.get('readNotifications', List())
    }

    activity() {
        return this.get('activity', List())
    }

    // Queries

    unreadCount() {
        return this.get('unreadCount', 0)
    }

}