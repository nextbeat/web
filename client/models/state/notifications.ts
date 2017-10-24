import { StateModelFactory } from '@models/state/base'
import { Map, List } from 'immutable'

const keyMap = {
    // notifications
    'activity': ['activity'],
    'isFetching': ['isFetching'],
    'error': ['error'],
    'unreadCount': ['unreadCount']
}

export default class Notifications extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['user', 'notifications'];
    }

    activity() {
        return this.get('activity', List())
    }

    // Queries

    unreadCount() {
        return this.get('unreadCount', 0)
    }

}