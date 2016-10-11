import { assign } from 'lodash'
import { ActionTypes, PushTypes } from '../../actions'
import { Push } from '../../models'

import * as web from './web'
import * as safari from './safari'

const isWeb = typeof navigator !== 'undefined' && 'serviceWorker' in navigator
const isSafari = typeof window !== 'undefined' && 'safari' in window && 'pushNotification' in window.safari

export default store => next => action => {

    const push = new Push(store.getState())

    // On load, register service worker (if applicable)
    // and check current notification permissions
    function initialize() {
        if (isWeb) {
            return web.initialize(store, next, action)
        } else if (isSafari) {
            return safari.initialize(store, next, action)
        } else {
            return next(assign({}, action, {
                pushStatus: PushTypes.UNSUPPORTED,
                error: 'Push notifications are not supported.'
            }))
        }
    }

    // Requests permission to subscribe to push notifications
    function subscribe() {
        if (push.isSubscribed() || push.isUnsupported()) {
            return;
        }

        if (isWeb) {
            return web.subscribe(store, next, action)
        } else if (isSafari) {
            return safari.subscribe(store, next, action)
        }
    }

    if (action.type === ActionTypes.PUSH_INITIALIZE) {
        return initialize()
    } else if (action.type === ActionTypes.PUSH_SUBSCRIBE) {
        return subscribe()
    }

    // Proceed to next middleware by default
    return next(action)
}