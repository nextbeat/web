import assign from 'lodash/assign'

import { PushTypes, pushSyncSubscription, pushSubscribe } from '../../actions'
import { urlBase64ToUint8Array } from '../../utils'
import { Push } from '../../models'

function initializePostRegister(store, next, action) {
    // Check that necessary APIs are supported in the browser
    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
        return next(assign({}, action, {
            pushStatus: PushTypes.UNSUPPORTED,
            error: 'Notifications are not supported.'
        }))
    } 
    if (Notification.permission === 'denied') {
        return next(assign({}, action, {
            pushStatus: PushTypes.DENIED,
            error: 'User has disabled push notifications.'
        }))
    }
    if (!('PushManager' in window)) {
        return next(assign({}, action, {
            pushStatus: PushTypes.UNSUPPORTED,
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
                pushStatus: PushTypes.UNSUBSCRIBED
            }))
        } else {
            // Update subscription on server
            store.dispatch(pushSyncSubscription('web', subscription))

            return next(assign({}, action, {
                pushStatus: PushTypes.SUBSCRIBED,
                pushType: 'web',
                subscription
            }))
        }
    }).catch(e => {
        return next(assign({}, action, {
            pushStatus: PushTypes.ERROR,
            error: e
        }))
    })

}

export function initialize(store, next, action) {
    // Register service worker
    navigator.serviceWorker
        .register('/push-worker.js')
        .then(initializePostRegister.bind(this, store, next, action))
        .catch(e => {
            return next(assign({}, action, {
                pushStatus: PushTypes.ERROR,
                error: e
            }))
        })
}

export function subscribe(store, next, action) {
    const push = new Push(store.getState())

    navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
        return serviceWorkerRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(push.get('vapidPublicKey'))
        }).then(subscription => {
            // Subscription was successful
            // Update subscription on server
            store.dispatch(pushSyncSubscription(subscription))

            return next(assign({}, action, {
                pushStatus: PushTypes.SUBSCRIBED,
                subscription
            }))
        }).catch(e => {
            if (Notification.permission === 'denied') {
                // User manually denied push notifications
                return next(assign({}, action, {
                    pushStatus: PushTypes.DENIED,
                    error: 'Notification permission was denied.'
                }))
            } else {
                return next(assign({}, action, {
                    pushStatus: PushTypes.ERROR,
                    error: e
                }))
            }
        })
    })
}