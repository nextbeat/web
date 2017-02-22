import ActionTypes from './types'
import { AnalyticsTypes } from './types'

/* NOTE: DEPRECATED. CURRENTLY USING GOOGLE ANALYTICS EXCLUSIVELY */

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