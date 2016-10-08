import { assign } from 'lodash'
import Promise from 'bluebird'
import fetch from 'isomorphic-fetch'

import { ActionTypes, PushTypes, pushSyncSubscription, pushSubscribe } from '../actions'
import { urlBase64ToUint8Array } from '../utils'
import { Push } from '../models'

export default store => next => action => {

    const push = new Push(store.getState())

    function nextWith(data) {
        next(assign({}, action, data))
    }

    function initializePostRegister() {

        // Check that necessary APIs are supported in the browser
        if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
            return nextWith({
                pushStatus: PushTypes.UNSUPPORTED,
                error: 'Notifications are not supported.'
            })
        } 
        if (Notification.permission === 'denied') {
            return nextWith({
                pushStatus: PushTypes.DENIED,
                error: 'User has disabled push notifications.'
            })
        }
        if (!('PushManager' in window)) {
            return nextWith({
                pushStatus: PushTypes.UNSUPPORTED,
                error: 'Push messaging is not supported.'
            })
        }

        // Wait until service worker is ready
        navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
            return serviceWorkerRegistration.pushManager.getSubscription()
        }).then(subscription => {
            if (!subscription) {
                // Not subscribed yet
                return nextWith({
                    pushStatus: PushTypes.UNSUBSCRIBED
                })
            } else {
                // Update subscription on server
                store.dispatch(pushSyncSubscription(subscription))

                return nextWith({
                    pushStatus: PushTypes.SUBSCRIBED,
                    subscription
                })
            }
        }).catch(e => {
            return nextWith({
                pushStatus: PushTypes.ERROR,
                error: e
            })
        })

    }

    function initialize() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/push-worker.js')
                .then(initializePostRegister)
                .catch(e => {
                    return nextWith({
                        pushStatus: PushTypes.ERROR,
                        error: e
                    })
                })
        } else {
            nextWith({
                pushStatus: PushTypes.UNSUPPORTED,
                error: 'Service workers are not supported.'
            })
        }
    }

    function subscribe() {
        if (push.isSubscribed()) {
            return;
        }
        
        navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
            return serviceWorkerRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(push.get('vapidPublicKey'))
            }).then(subscription => {
                // Subscription was successful
                // Update subscription on server
                store.dispatch(pushSyncSubscription(subscription))

                return nextWith({
                    pushStatus: PushTypes.SUBSCRIBED,
                    subscription
                })
            }).catch(e => {
                if (Notification.permission === 'denied') {
                    // User manually denied push notifications
                    return nextWith({
                        pushStatus: PushTypes.DENIED,
                        error: 'Notification permission was denied.'
                    })
                } else {
                    return nextWith({
                        pushStatus: PushTypes.ERROR,
                        error: e
                    })
                }
            })
        })
    }

    if (action.type === ActionTypes.PUSH_INITIALIZE) {
        return initialize()
    } else if (action.type === ActionTypes.PUSH_SUBSCRIBE) {
        return subscribe()
    }

    // proceed to next middleware by default
    return next(action)
}