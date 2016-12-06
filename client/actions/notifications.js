import assign from 'lodash/assign'

import { Status } from './types'
import ActionTypes from './types'
import { CurrentUser, Notifications, Stack } from '../models'
import Schemas from '../schemas'
import { API_CALL, API_CANCEL } from './types'

/*******************
 * FETCHING ACTIVITY
 *******************/

function fetchNotifications() {
    return {
        type: ActionTypes.NOTIFICATIONS,
        [API_CALL]: {
            endpoint: "notifications",
            authenticated: true
        }
    }
}

export function loadNotifications() {
    // todo: pagination?
    return fetchNotifications();
}

/****************
 * SYNCING UNREAD
 ****************/

function onUnreadNotificationSyncSuccess(store, next, action, response) {
    // if a stack is loaded on the app, mark as read immediately
    store.dispatch(markStackAsRead())
}

function postSyncUnreadNotifications(readNotifications) {
    return {
        type: ActionTypes.SYNC_UNREAD_NOTIFICATIONS,
        [API_CALL]: {
            method: 'POST',
            endpoint: 'notifications/sync',
            authenticated: true,
            body: readNotifications,
            onSuccess: onUnreadNotificationSyncSuccess
        }
    }
}

export function syncUnreadNotifications() {
    return (dispatch, getState) => {
        const currentUser = new CurrentUser(getState())
        if (!currentUser.isLoggedIn()) {
            return null;
        }

        const notifications = new Notifications(getState())
        const readNotifications = notifications.readNotifications().toJS()
        dispatch(postSyncUnreadNotifications(readNotifications))
    }
}


/**************
 * MARKING READ
 **************/

export function markAllAsRead() {
    return (dispatch, getState) => {
        const currentUser = new CurrentUser(getState())
        if (!currentUser.isLoggedIn()) {
            return null;
        }

        dispatch({ type: ActionTypes.MARK_ALL_AS_READ })
        // sync notifications to update server
        dispatch(syncUnreadNotifications())
    }
}

function markAsRead(options) {
    return (dispatch, getState) => {
        const currentUser = new CurrentUser(getState())
        if (!currentUser.isLoggedIn()) {
            return null;
        }

        dispatch(assign({}, { type: ActionTypes.MARK_AS_READ }, options))
        // sync notifications to update server
        dispatch(syncUnreadNotifications())
    }
}

export function markStackAsRead(id) {
    return (dispatch, getState) => {
        const stack = new Stack(getState())
        const currentUser = new CurrentUser(getState())
        id = id || stack.get('id');
        if (typeof id === "number") {
            id = id.toString();
        }

        if (!id) {
            // either did not specify stack id or no stack is loaded
            return null;
        }

        const notifications = new Notifications(getState())
        if (notifications.unreadMediaItemCount(id) === 0) {
            // if stack already marked as read, do nothing
            //
            // note that this method call might need to change 
            // when we have more than one notification type
            return null;
        }

        dispatch(markAsRead({ stack: id }))
    }
}


/*******
 * CLEAR
 *******/

export function clearNotifications() {
    return {
        type: ActionTypes.CLEAR_NOTIFICATIONS,
        [API_CANCEL]: {
            actionTypes: [ActionTypes.NOTIFICATIONS]
        }
    }
}