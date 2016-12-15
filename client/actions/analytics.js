import ActionTypes from './types'
import { AnalyticsTypes } from './types'

export function startNewSession() {
    return {
        type: ActionTypes.START_NEW_SESSION
    }
}

export function sendPendingEvents() {
    return {
        type: ActionTypes.SEND_PENDING_EVENTS
    }
}

export function logVideoImpression(id, startTime, endTime) {
    return {
        type: ActionTypes.LOG_VIDEO_IMPRESSION,
        id,
        startTime,
        endTime
    }
}