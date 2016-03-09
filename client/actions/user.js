import { assign } from 'lodash'
import fetch from 'isomorphic-fetch'

import { Status } from './types'
import ActionTypes from './types'
import { CurrentUser, Stack } from '../models'
import Schemas from '../schemas'
import { API_CALL } from '../middleware/api'

/**********
 * FETCHING
 **********/

function fetchBookmarkedStacks(pagination) {
    return {
        type: ActionTypes.BOOKMARKED_STACKS,
        [API_CALL]: {
            schema: Schemas.STACKS,
            endpoint: "stacks",
            queries: { bookmarked: "true" },
            authenticated: true,
            pagination
        }
    }
}

export function loadBookmarkedStacks() {
    // we don't use loadPaginatedObjects because we want
    // to be able to refresh this without incrementing the 
    // page, setting a beforeDate, etc
    return fetchBookmarkedStacks({
        limit: "all",
        page: "1"
    })
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
    return dispatch => {
        dispatch(syncNotifications())
        dispatch(loadBookmarkedStacks())
    }
}

/***************
 * NOTIFICATIONS
 ***************/

function onNotificationSyncSuccess(store, next, action, response) {
    // if a stack is loaded on the app, mark as read immediately
    store.dispatch(markStackAsRead())
}

export function syncNotifications() {
    return {
        type: ActionTypes.SYNC_NOTIFICATIONS,
        [API_CALL]: {
            method: 'POST',
            endpoint: 'notifications/sync',
            authenticated: true,
            onSuccess: onNotificationSyncSuccess
        }
    }
}

function markAsRead(options) {
    return (dispatch, getState) => {
        const currentUser = new CurrentUser(getState())
        if (!currentUser.isLoggedIn()) {
            return null;
        }

        dispatch(assign({}, { type: ActionTypes.MARK_AS_READ }, options))
    }
}

export function markStackAsRead(id) {
    return (dispatch, getState) => {
        const stack = new Stack(getState())
        id = id || stack.get('id');
        if (!id) {
            // either did not specify stack id or no stack is loaded
            return null;
        }
        if (typeof id === "number") {
            id = id.toString();
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
