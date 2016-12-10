import { List, Map } from 'immutable'
import StateModel from './base'
import { AnalyticsTypes, AnalyticsSessionTypes } from '../../actions'

const KEY_MAP = {
    'userId': ['userId'],
    'activeSessions': ['activeSessions'],
    'chatTimeoutId': ['chatTimeoutId']
}

export default class Analytics extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['analytics'];
    }

    getActiveSession(type) {
        return this.get('activeSessions', List()).find(session => session.get('type') === type)
    }

    hasActiveSession(type) {
        return !!this.getActiveSession(type)
    }

    static sessionTypeString(sessionType) {
        switch (sessionType) {
            case AnalyticsSessionTypes.APP:
                return 'session-app'
            case AnalyticsSessionTypes.STACK:
                return 'session-stack'
            case AnalyticsSessionTypes.CHAT:
                return 'session-chat'
        }
    }

    static typeString(eventType, sessionType) {
        switch (eventType) {
            case AnalyticsTypes.SESSION_START:
                return `event-${this.sessionTypeString(sessionType)}-start`
            case AnalyticsTypes.SESSION_STOP:
                return `event-${this.sessionTypeString(sessionType)}-stop`
            case AnalyticsTypes.VIDEO_IMPRESSION:
                return 'event-video-impression'
        }
    }

}