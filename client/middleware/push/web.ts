import assign from 'lodash-es/assign'

import { pushSyncSubscription, pushSubscribe, PushInitializeAction, PushSubscribeAction } from '@actions/push'
import { urlBase64ToUint8Array } from '@utils'
import Push, { PushStatus } from '@models/state/push'
import { Store, Dispatch } from '@types'

declare var Notification: {
    readonly permission: NotificationPermission
}

function initializePostRegister(store: Store, next: Dispatch, action: PushInitializeAction) {
    // Check that necessary APIs are supported in the browser
    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
        return next(assign({}, action, {
            pushStatus: PushStatus.UNSUPPORTED,
            error: 'Notifications are not supported.'
        }))
    } 
    if (Notification.permission === 'denied') {
        return next(assign({}, action, {
            pushStatus: PushStatus.DENIED,
            error: 'User has disabled push notifications.'
        }))
    }
    if (!('PushManager' in window)) {
        return next(assign({}, action, {
            pushStatus: PushStatus.UNSUPPORTED,
            error: 'Push messaging is not supported.'
        }))
    }

    // Wait until service worker is ready
    navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
        return serviceWorkerRegistration.pushManager.getSubscription()
    }).then(subscription => {
        if (!subscription) {
            // Prompt subscription request on initial load
            store.dispatch(pushSubscribe())
            // Not subscribed yet
            return next(assign({}, action, {
                pushStatus: PushStatus.UNSUBSCRIBED
            }))
        } else {
            // Update subscription on server
            store.dispatch(pushSyncSubscription('web', subscription))

            return next(assign({}, action, {
                pushStatus: PushStatus.SUBSCRIBED,
                pushType: 'web',
                subscription
            }))
        }
    }).catch(e => {
        return next(assign({}, action, {
            pushStatus: PushStatus.ERROR,
            error: e
        }))
    })

}

export function initialize(store: Store, next: Dispatch, action: PushInitializeAction) {
    // Register service worker
    navigator.serviceWorker
        .register('/push-worker.js')
        .then(initializePostRegister.bind(this, store, next, action))
        .catch(e => {
            return next(assign({}, action, {
                pushStatus: PushStatus.ERROR,
                error: e
            }))
        })
}

export function subscribe(store: Store, next: Dispatch, action: PushSubscribeAction) {

    navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
        return serviceWorkerRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(Push.get(store.getState(), 'vapidPublicKey'))
        }).then(subscription => {
            // Subscription was successful
            // Update subscription on server
            store.dispatch(pushSyncSubscription('web', subscription))

            return next(assign({}, action, {
                pushStatus: PushStatus.SUBSCRIBED,
                subscription
            }))
        }).catch(e => {
            if (Notification.permission === 'denied') {
                // User manually denied push notifications
                return next(assign({}, action, {
                    pushStatus: PushStatus.DENIED,
                    error: 'Notification permission was denied.'
                }))
            } else {
                return next(assign({}, action, {
                    pushStatus: PushStatus.ERROR,
                    error: e
                }))
            }
        })
    })
}