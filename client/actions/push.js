import ActionTypes from './types'
import { API_CALL, API_CANCEL } from './types'

export function pushInitialize() {
    return {
        type: ActionTypes.PUSH_INITIALIZE
    }
}

export function pushSubscribe() {
    return {
        type: ActionTypes.PUSH_SUBSCRIBE
    }
}

export function pushUnsubscribe() {
    return {
        type: ActionTypes.PUSH_UNSUBSCRIBE
    }
}

export function pushSyncSubscription(subscription) {
    return {
        type: ActionTypes.PUSH_SYNC_SUBSCRIPTION,
        [API_CALL]: {
            method: 'POST',
            authenticated: true,
            endpoint: 'notifications/web/subscribe',
            body: JSON.parse(JSON.stringify(subscription))
        }
    }
}