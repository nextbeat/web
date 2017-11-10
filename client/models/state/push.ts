import { List, Set } from 'immutable'

import { StateModelFactory } from '@models/state/base'
import { State } from '@types' 

export enum PushStatus {
    SUBSCRIBED = 'SUBSCRIBED',
    UNSUBSCRIBED = 'UNSUBSCRIBED',
    UNSUPPORTED = 'UNSUPPORTED',
    DENIED = 'DENIED',
    ERROR = 'ERROR'
}

export interface PushSubscriptionObject {
    type: 'web' | 'safari'
    subscription: any
}

interface PushProps {
    vapidPublicKey: string
    pushStatus: PushStatus
    pushType: 'web' | 'safari'
    subscription: any
}

const keyMap = {
    // constants
    'vapidPublicKey': ['vapidPublicKey'],
    'pushStatus': ['pushStatus'],
    'pushType': ['pushType'],
    'subscription': ['subscription']
}

const keyMapPrefix = ['push']

export default class Push extends StateModelFactory<PushProps>(keyMap, keyMapPrefix) {

    static isSubscribed(state: State) {
        return this.get(state, 'pushStatus') === PushStatus.SUBSCRIBED
    }

    static isUnsubscribed(state: State) {
        return this.get(state, 'pushStatus') === PushStatus.UNSUBSCRIBED
    }

    static isUnsupported(state: State) {
        return this.get(state, 'pushStatus') === PushStatus.UNSUPPORTED
    }

    static formattedPushObject(state: State): PushSubscriptionObject | null {
        if (!this.isSubscribed(state) || !this.has(state, 'pushType') || !this.has(state, 'subscription')) {
            return null
        }

        return {
            type: this.get(state, 'pushType'),
            subscription: this.get(state, 'subscription')
        }
    }

}