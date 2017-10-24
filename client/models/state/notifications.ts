import { Map, List } from 'immutable'

import { StateModelFactory } from '@models/state/base'
import { State } from '@types'

interface NotificationsProps {
    activity: List<any>
    isFetching: boolean
    error: string
    unreadCount: number
}

const keyMap = {
    // notifications
    'activity': ['activity'],
    'isFetching': ['isFetching'],
    'error': ['error'],
    'unreadCount': ['unreadCount']
}

const keyMapPrefix = ['user', 'notifications']

export default class Notifications extends StateModelFactory<NotificationsProps>(keyMap, keyMapPrefix) {

    static activity(state: State): List<any> {
        return this.get(state, 'activity', List())
    }

    // Queries

    static unreadCount(state: State): number {
        return this.get(state, 'unreadCount', 0)
    }

}