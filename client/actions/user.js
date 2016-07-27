import { assign } from 'lodash'
import { Map } from 'immutable'
import fetch from 'isomorphic-fetch'
import { normalize } from 'normalizr'

import { Status } from './types'
import ActionTypes from './types'
import { CurrentUser, Stack } from '../models'
import Schemas from '../schemas'
import { API_CALL, API_CANCEL } from './types'
import { analyticsIdentify } from './analytics'

/**********
 * FETCHING
 **********/

function fetchBookmarkedStacks(stackStatus, pagination) {
    return {
        type: ActionTypes.BOOKMARKED_STACKS,
        stackStatus,
        [API_CALL]: {
            schema: Schemas.STACKS,
            endpoint: "stacks",
            queries: { bookmarked: "true", "status": stackStatus },
            authenticated: true,
            pagination
        }
    }
}

export function loadBookmarkedStacks(stackStatus="open") {
    // we don't use loadPaginatedObjects because we want
    // to be able to refresh this without incrementing the 
    // page, setting a beforeDate, etc
    return fetchBookmarkedStacks(stackStatus, {
        limit: "all",
        page: "1"
    })
}

function fetchSubscriptions(pagination) {
    return {
        type: ActionTypes.SUBSCRIPTIONS,
        [API_CALL]: {
            schema: Schemas.USERS,
            endpoint: "users",
            queries: { "subscriptions": "true" },
            authenticated: true,
            pagination
        }
    }
}

export function loadSubscriptions() {
    return fetchSubscriptions({
        limit: "all",
        page: 1
    });
}

/******
 * AUTH
 ******/

export function login(username, password) {
    return (dispatch, getState) => {
        // exit early if already logged in
        const currentUser = new CurrentUser(getState())
        if (currentUser.isLoggedIn()) {
            return null;
        }

        function actionWith(status, data) {
            return assign({ type: ActionTypes.LOGIN }, { status }, data)
        }

        dispatch(actionWith(Status.REQUESTING));

        fetch('/login', { 
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username, 
                password
            })
        })
        .then(res => res.json().then(json => ({json, res})))
        .then(({json, res}) => {
            if (!res.ok) {
                return dispatch(actionWith(Status.FAILURE, json))
            }
            dispatch(actionWith(Status.SUCCESS, { user: json }))
            dispatch({
                type: ActionTypes.ENTITY_UPDATE,
                response: normalize(json, Schemas.USER)
            })
            // we wait until the next tick so the reducer updates state first
            process.nextTick(() => {
                dispatch(postLogin())
            })
        });
    }
}

export function logout() {
    return (dispatch, getState) => {
        // exit early if already logged out
        const currentUser = new CurrentUser(getState())
        if (!currentUser.isLoggedIn()) {
            return null;
        }

        function actionWith(status, data) {
            return assign({ type: ActionTypes.LOGOUT }, { status }, data)
        }

        dispatch(actionWith(Status.REQUESTING));

        fetch('/logout', {
            method: 'POST',
            credentials: 'same-origin'
        })
        .then(res => {
            if (!res.ok) {
                return dispatch(actionWith(Status.FAILURE));
            }
            return dispatch(actionWith(Status.SUCCESS));
        });
    }
}

export function signup(credentials) {
    return (dispatch, getState) => {

        function actionWith(status, data) {
            return assign({ type: ActionTypes.SIGNUP }, { status }, data)
        }

        if (!credentials.username || !credentials.password || !credentials.email) {
            return dispatch(actionWith(Status.FAILURE, { error: 'All fields must be filled in.' }));
        }

        fetch('/signup', { 
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        })
        .then(res => res.json().then(json => ({json, res})))
        .then(({json, res}) => {
            if (!res.ok) {
                return dispatch(actionWith(Status.FAILURE, json))
            }
            dispatch(actionWith(Status.SUCCESS, { user: json }))
            process.nextTick(() => {
                dispatch(login(credentials.username, credentials.password))
            })
        });
    }
}

export function postLogin() {
    return (dispatch, getState) => {
        const user = new CurrentUser(getState())
        dispatch(analyticsIdentify(user))
        dispatch(syncNotifications())
        dispatch(loadBookmarkedStacks("open"))
        dispatch(loadSubscriptions())
    }
}

/**************
 * SUBSCRIPTION
 **************/

 function onSubscribeSuccess(store, next, action, response) {
    const user = CurrentUser.getEntity(store.getState(), action.id)
    const newUser = {
        id: user.get('id'),
        subscriber_count: user.get('subscriber_count', 0) + 1
    }
    store.dispatch({
        type: ActionTypes.ENTITY_UPDATE,
        response: normalize(newUser, Schemas.USER)
    })
}

function postSubscribe(subscription_id) {
    return {
        type: ActionTypes.SUBSCRIBE,
        id: subscription_id,
        [API_CALL]: {
            method: 'POST',
            endpoint: `users/${subscription_id}/subscribe`,
            authenticated: true,
            onSuccess: onSubscribeSuccess
        }
    }
}

export function subscribe(user) {
    return (dispatch, getState) => {
        if (Map.isMap(user)) {
            user = user.get('id')
        }

        const currentUser = new CurrentUser(getState())
        if (currentUser.get('id') === user) {
            // can't subscribe to yourself
            return;
        }

        dispatch(postSubscribe(user))
    }
}

function onUnsubscribeSuccess(store, next, action, response) {
    const user = CurrentUser.getEntity(store.getState(), action.id)
    const newUser = {
        id: user.get('id'),
        subscriber_count: user.get('subscriber_count', 0) - 1
    }
    store.dispatch({
        type: ActionTypes.ENTITY_UPDATE,
        response: normalize(newUser, Schemas.USER)
    })
}

function postUnsubscribe(subscription_id) {
    return {
        type: ActionTypes.UNSUBSCRIBE,
        id: subscription_id,
        [API_CALL]: {
            method: 'POST',
            endpoint: `users/${subscription_id}/unsubscribe`,
            authenticated: true,
            onSuccess: onUnsubscribeSuccess
        }
    }
}

export function unsubscribe(user) {
    return (dispatch, getState) => {
        if (Map.isMap(user)) {
            user = user.get('id')
        }
        const currentUser = new CurrentUser(getState())
        if (currentUser.get('id') === user) {
            // can't unsubscribe to yourself
            return;
        }
        dispatch(postUnsubscribe(user))
    }
}

/***************
 * NOTIFICATIONS
 ***************/

function onNotificationSyncSuccess(store, next, action, response) {
    // if a stack is loaded on the app, mark as read immediately
    store.dispatch(markStackAsRead())
}

function postSyncNotifications(readNotifications) {
    return {
        type: ActionTypes.SYNC_NOTIFICATIONS,
        [API_CALL]: {
            method: 'POST',
            endpoint: 'notifications/sync',
            authenticated: true,
            body: readNotifications,
            onSuccess: onNotificationSyncSuccess
        }
    }
}

export function syncNotifications() {
    return (dispatch, getState) => {
        const currentUser = new CurrentUser(getState())
        if (!currentUser.isLoggedIn()) {
            return null;
        }

        const readNotifications = currentUser.readNotificationsJSON()
        dispatch(postSyncNotifications(readNotifications))
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
        dispatch(syncNotifications())
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

        if (currentUser.unreadNotificationCountForStack(id) === 0) {
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
 * RESET
 *******/

function clearLoginSignup() {
    return {
        type: ActionTypes.CLEAR_LOGIN_SIGNUP
    }
}

export function clearLogin() {
    return clearLoginSignup()
}

export function clearSignup() {
    return clearLoginSignup()
}

export function clearClosedBookmarkedStacks() {
    return {
        type: ActionTypes.CLEAR_CLOSED_BOOKMARKED_STACKS,
        stackStatus: 'closed'
    }
}
