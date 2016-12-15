import { List, Set } from 'immutable'
import StateModel from './base'
import { PushTypes } from '../../actions'

const KEY_MAP = {
    // constants
    'vapidPublicKey': ['vapidPublicKey'],
    'pushStatus': ['pushStatus'],
    'pushType': ['pushType'],
    'subscription': ['subscription']
}

export default class Push extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['push'];
    }

    isSubscribed() {
        return this.get('pushStatus') === PushTypes.SUBSCRIBED
    }

    isUnsubscribed() {
        return this.get('pushStatus') === PushTypes.UNSUBSCRIBED
    }

    isUnsupported() {
        return this.get('pushStatus') === PushTypes.UNSUPPORTED
    }

    formattedPushObject() {
        if (!this.isSubscribed() || !this.has('pushType') || !this.has('subscription')) {
            return {}
        }
        
        return {
            type: this.get('pushType'),
            subscription: this.get('subscription')
        }
    }

}