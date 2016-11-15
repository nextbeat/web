import { List, Map } from 'immutable'
import StateModel from './base'

const KEY_MAP = {
    'userId': ['analytics', 'userId'],
    'activeSessions': ['analytics', 'activeSessions']
}

export default class Analytics extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "analytics";
    }

    getActiveSession(type) {
        return this.get('activeSessions', List()).find(session => session.get('type') === type)
    }

    hasActiveSession(type) {
        return !!this.getActiveSession(type)
    }


}