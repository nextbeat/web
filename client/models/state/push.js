import { List, Set } from 'immutable'
import StateModel from './base'
import { PushTypes } from '../../actions'

const KEY_MAP = {
    // constants
    'vapidPublicKey': ['push', 'vapidPublicKey'],
    'pushStatus': ['push', 'pushStatus']
}

export default class Push extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "push";
    }

    isSubscribed() {
        return this.get('pushStatus') === PushTypes.SUBSCRIBED
    }

    isUnsubscribed() {
        return this.get('pushStatus') === PushTypes.UNSUBSCRIBED
    }

}