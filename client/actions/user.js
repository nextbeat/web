import { assign } from 'lodash'
import { Map } from 'immutable'
import fetch from 'isomorphic-fetch'
import { normalize } from 'normalizr'
import moment from 'moment'

import { Status } from './types'
import ActionTypes from './types'
import { CurrentUser, Stack, Push } from '../models'
import Schemas from '../schemas'
import { API_CALL, API_CANCEL, GA, GATypes } from './types'
import { gaIdentify, gaEvent } from './ga'
import { pushInitialize, pushSubscribe } from './push'
import { syncUnreadNotifications } from './notifications'
import { startNewSession } from './analytics'
import { isValidUrl } from '../utils'


/******
 * SYNC
 ******/

export function syncStacks(status='all', deep=true, newStack) {
    // to do: grab correct max last modified
    let objectsToSync = newStack ? [newStack] : []
    let maxLastModified = moment.unix(0).format()

    return {
        type: ActionTypes.SYNC_STACKS,
        submitting: objectsToSync.length > 0,
        [API_CALL]: {
            schema: Schemas.STACKS,
            method: 'POST',
            endpoint: "stacks/v2/sync",
            queries: { status, deep },
            body: {
                maxLastModified,
                objectsToSync
            }
        }
    }
}

/********
 * UPDATE
 ********/

function postUpdateUser(uuid, userObject) {
    return {
        type: ActionTypes.UPDATE_USER,
        [API_CALL]: {
            Schema: Schemas.USER,
            method: 'PUT',
            endpoint: `users/${uuid}`,
            body: userObject
        }
    }
}

export function updateUser(userObject) {
    return (dispatch, getState) => {
        const currentUser = new CurrentUser(getState())
        if (!currentUser.isLoggedIn()) {
            return null;
        }

        const uuid = currentUser.get('uuid')
        if (!uuid) {
            return null;
        }

        dispatch(postUpdateUser(uuid, assign(userObject, { uuid })))
    }
}

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

        // Include subscription object if available
        // so that it is disabled once user has logged out
        const push = new Push(getState())
        fetch('/logout', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(push.formattedPushObject())
        })
        .then(res => {
            if (!res.ok) {
                return dispatch(actionWith(Status.FAILURE));
            }
            dispatch(actionWith(Status.SUCCESS));
            // we wait until the next tick so the reducer updates state first
            process.nextTick(() => {
                dispatch(postLogout())
            })
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
            dispatch(actionWith(Status.SUCCESS, { 
                user: json.body,
                [GA]: {
                    type: GATypes.EVENT,
                    category: 'user',
                    action: 'signup',
                    label: json.body.username
                }
            }))
            process.nextTick(() => {
                dispatch(login(credentials.username, credentials.password))
            })
        });
    }
}

export function postLogin() {
    return (dispatch, getState) => {
        const user = new CurrentUser(getState())
        dispatch(gaIdentify(user))
        dispatch(syncUnreadNotifications())
        dispatch(loadBookmarkedStacks("open"))
        dispatch(loadSubscriptions())
        dispatch(pushInitialize())
        // dispatch(startNewSession())
    }
}

function postLogout() {
    return dispatch => {
        // dispatch(startNewSession())
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
    store.dispatch(gaEvent({
        category: 'user',
        action: 'subscribe',
        label: user.get('username')
    }))
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
    store.dispatch(gaEvent({
        category: 'user',
        action: 'unsubscribe',
        label: user.get('username')
    }))
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

export function clearEditProfile() {
    return {
        type: ActionTypes.CLEAR_EDIT_PROFILE,
        [API_CANCEL]: {
            actionTypes: [ActionTypes.UPDATE_USER]
        }
    }
}

export function clearClosedBookmarkedStacks() {
    return {
        type: ActionTypes.CLEAR_CLOSED_BOOKMARKED_STACKS,
        stackStatus: 'closed'
    }
}
