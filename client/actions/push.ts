import { ActionType, GenericAction } from '@actions/types'

export type PushActionAll =
    PushInitializeAction |
    PushSubscribeAction |
    PushUnsubscribeAction |
    PushSyncSubscriptionAction

export interface PushInitializeAction extends GenericAction {
    type: ActionType.PUSH_INITIALIZE
}
export function pushInitialize(): PushInitializeAction {
    return {
        type: ActionType.PUSH_INITIALIZE
    }
}

export interface PushSubscribeAction extends GenericAction {
    type: ActionType.PUSH_SUBSCRIBE
}
export function pushSubscribe(): PushSubscribeAction {
    return {
        type: ActionType.PUSH_SUBSCRIBE
    }
}

export interface PushUnsubscribeAction extends GenericAction {
    type: ActionType.PUSH_UNSUBSCRIBE
}
export function pushUnsubscribe(): PushUnsubscribeAction {
    return {
        type: ActionType.PUSH_UNSUBSCRIBE
    }
}

export interface PushSyncSubscriptionAction extends GenericAction {
    type: ActionType.PUSH_SYNC_SUBSCRIPTION
}
export function pushSyncSubscription(clientType: 'web' | 'safari', subscription: any) {
    return {
        type: ActionType.PUSH_SYNC_SUBSCRIPTION,
        API_CALL: {
            method: 'POST',
            authenticated: true,
            endpoint: 'notifications/subscribe',
            body: {
                type: clientType,
                subscription: JSON.parse(JSON.stringify(subscription))
            }
        }
    }
}