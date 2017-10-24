import assign from 'lodash-es/assign'
import { ActionType, Action } from '@actions/types'
import { PushInitializeAction, PushSubscribeAction } from '@actions/push'
import Push, { PushStatus } from '@models/state/push'
import { Store, Dispatch } from '@types'

import * as web from './web'
import * as safari from './safari'

const isWeb = typeof navigator !== 'undefined' && 'serviceWorker' in navigator
const isSafari = typeof window !== 'undefined' && 'safari' in window && 'pushNotification' in (window as any).safari

export default (store: Store) => (next: Dispatch) => (action: Action) => {

    const state = store.getState()

    // On load, register service worker (if applicable)
    // and check current notification permissions
    function initialize() {
        if (isWeb) {
            return web.initialize(store, next, action)
        } else if (isSafari) {
            return safari.initialize(store, next, action as PushInitializeAction)
        } else {
            return next(assign({}, action, {
                pushStatus: PushStatus.UNSUPPORTED,
                error: 'Push notifications are not supported.'
            }))
        }
    }

    // Requests permission to subscribe to push notifications
    function subscribe() {
        if (Push.isSubscribed(state) || Push.isUnsupported(state)) {
            return;
        }

        if (isWeb) {
            return web.subscribe(store, next, action)
        } else if (isSafari) {
            return safari.subscribe(store, next, action as PushSubscribeAction)
        }
    }

    if (action.type === ActionType.PUSH_INITIALIZE) {
        return initialize()
    } else if (action.type === ActionType.PUSH_SUBSCRIBE) {
        return subscribe()
    }

    // Proceed to next middleware by default
    return next(action)
}