import assign from 'lodash-es/assign'

import { pushSubscribe, pushSyncSubscription, PushSubscribeAction, PushInitializeAction } from '@actions/push'
import { PushStatus } from '@models/state/push'
import CurrentUser from '@models/state/currentUser'
import { baseApiUrl } from '@utils'
import { NotLoggedInError } from '@errors'
import { Store, Dispatch } from '@types'

function checkPermission(store: Store, next: Dispatch, action: PushInitializeAction | PushSubscribeAction, permissionData: any) {
    if (permissionData.permission === 'default') {
        // Prompt subscription request on initial load
        store.dispatch(pushSubscribe())
        // User has not yet indicated if they want to receive notifications
        return next(assign({}, action, {
            pushStatus: PushStatus.UNSUBSCRIBED
        }))
    } else if (permissionData.permission === 'denied') {
        // User has said no, thank you very much
        return next(assign({}, action, {
            pushStatus: PushStatus.DENIED,
            error: 'User has disabled push notifications.'
        }))
    } else if (permissionData.permission === 'granted') {
        // User has granted push notifications
        // Update subscription on server
        const subscription = {
            device_token: permissionData.deviceToken
        }
        store.dispatch(pushSyncSubscription('safari', subscription))
        return next(assign({}, action, {
            pushStatus: PushStatus.SUBSCRIBED,
            pushType: 'safari',
            subscription
        }))
    }
}

export function initialize(store: Store, next: Dispatch, action: PushInitializeAction) {
    var permissionData = (window as any).safari.pushNotification.permission('web.co.nextbeat.nextbeat')
    checkPermission(store, next, action, permissionData)
}

export function subscribe(store: Store, next: Dispatch, action: PushSubscribeAction) {
    const state = store.getState()

    if (!CurrentUser.isLoggedIn(state)) {
        return next(assign({}, action, {
            pushStatus: PushStatus.ERROR,
            error: new NotLoggedInError()
        }))
    }

    (window as any).safari.pushNotification.requestPermission(
        `${baseApiUrl()}/push-safari`,
        'web.co.nextbeat.nextbeat',
        { uuid: CurrentUser.entity(state).get('uuid') },
        checkPermission.bind(this, store, next, action)
    );
}