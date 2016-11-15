import ActionTypes from './types'
import { ANALYTICS, AnalyticsTypes } from './types'

export function startNewSession() {
    return {
        type: ActionTypes.START_NEW_SESSION
    }
}

export function endSession() {
    return {
        type: ActionTypes.END_SESSION
    }
}