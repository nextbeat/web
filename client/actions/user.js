import { assign } from 'lodash'
import fetch from 'isomorphic-fetch'

import { Status } from './types'
import ActionTypes from './types'
import { CurrentUser } from '../models'
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
            endpoint: `stacks/bookmarked`,
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
                dispatch(loadBookmarkedStacks())
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
            console.log(res);
            dispatch(actionWith(Status.SUCCESS, { user: json }))
            process.nextTick(() => {
                dispatch(login(credentials.username, credentials.password))
            })
        });
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
