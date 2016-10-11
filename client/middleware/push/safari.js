import { assign } from 'lodash'

import { PushTypes, pushSyncSubscription, pushSubscribe } from '../../actions'
import { CurrentUser, App } from '../../models'
import { baseApiUrl } from '../../utils'

function checkPermission(store, next, action, permissionData) {
    if (permissionData.permission === 'default') {
        // TEMPORARY
        store.dispatch(pushSubscribe())
        // User has not yet indicated if they want to receive notifications
        return next(assign({}, action, {
            pushStatus: PushTypes.UNSUBSCRIBED
        }))
    } else if (permissionData.permission === 'denied') {
        // User has said no, thank you very much
        return next(assign({}, action, {
            pushStatus: PushTypes.DENIED,
            error: 'User has disabled push notifications.'
        }))
    } else if (permissionData.permission === 'granted') {
        // User has granted push notifications
        return next(assign({}, action, {
            pushStatus: PushTypes.SUBSCRIBED
        }))
    }
}

export function initialize(store, next, action) {
    var permissionData = window.safari.pushNotification.permission('web.co.nextbeat.nextbeat')
    checkPermission(store, next, action, permissionData)
}

export function subscribe(store, next, action) {
    const app           = new App(store.getState())
    const currentUser   = new CurrentUser(store.getState())

    if (!currentUser.isLoggedIn()) {
        return next(assign({}, action, {
            pushStatus: PushTypes.ERROR,
            error: 'User is not logged in.'
        }))
    }

    console.log('requesting permission')
    window.safari.pushNotification.requestPermission(
        `${baseApiUrl(app.get('environment'))}/push-safari`,
        'web.co.nextbeat.nextbeat',
        { uuid: currentUser.get('uuid') },
        checkPermission.bind(this, store, next, action)
    );
}