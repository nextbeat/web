import assign from 'lodash-es/assign'
import { Map } from 'immutable'
import * as fetch from 'isomorphic-fetch'
import * as Promise from 'bluebird'
import { normalize } from 'normalizr'
import * as format from 'date-fns/format'

import { Store, Dispatch } from '@types'
import { 
    ActionType, 
    ApiCallAction, 
    GenericAction,
    AnalyticsAction,
    ThunkAction,
    Pagination,
    Status
} from '@actions/types'
import { identifyEddy, unidentifyEddy } from '@actions/eddy'
import { gaEvent, gaIdentify } from '@actions/ga'
import { pushInitialize } from '@actions/push'
import CurrentUser from '@models/state/currentUser'
import Push, { PushSubscriptionObject } from '@models/state/push'
import UserEntity from '@models/entities/user'
import * as Schemas from '@schemas'

export type UserActionAll = 
    SyncStacksAction |
    BookmarkedStacksAction |
    SubscriptionsAction |
    LoginAction |
    LogoutAction |
    SignupAction |
    SubscribeAction |
    UnsubscribeAction |
    ClearLoginSignupAction |
    ClearClosedBookmarkedStacksAction 
    

/******
 * SYNC
 ******/

interface SyncStacksAction extends ApiCallAction {
    type: ActionType.SYNC_STACKS
    submitting: boolean
}
export function syncStacks(status='all', deep=true, newStack?: any): SyncStacksAction {
    // to do: grab correct max last modified
    let objectsToSync = newStack ? [newStack] : []
    let maxLastModified = format(0)

    return {
        type: ActionType.SYNC_STACKS,
        submitting: objectsToSync.length > 0,
        API_CALL: {
            schema: Schemas.Stacks,
            method: 'POST',
            endpoint: "stacks/v2/sync",
            queries: { 
                status, 
                deep: deep.toString() 
            },
            body: {
                maxLastModified,
                objectsToSync
            }
        }
    }
}


/**********
 * FETCHING
 **********/

type StackStatus = 'open' | 'closed'

interface BookmarkedStacksAction extends ApiCallAction {
    type: ActionType.BOOKMARKED_STACKS
    stackStatus: StackStatus
}
function fetchBookmarkedStacks(stackStatus: StackStatus, pagination: Pagination): BookmarkedStacksAction {
    return {
        type: ActionType.BOOKMARKED_STACKS,
        stackStatus,
        API_CALL: {
            schema: Schemas.Stacks,
            endpoint: "stacks",
            queries: { bookmarked: "true", "status": stackStatus },
            authenticated: true,
            pagination
        }
    }
}

export function loadBookmarkedStacks(stackStatus: StackStatus): BookmarkedStacksAction  {
    // we don't use loadPaginatedObjects because we want
    // to be able to refresh this without incrementing the 
    // page, setting a beforeDate, etc
    return fetchBookmarkedStacks(stackStatus, {
        limit: "all",
        page: 1
    })
}

interface SubscriptionsAction extends ApiCallAction {
    type: ActionType.SUBSCRIPTIONS
}
function fetchSubscriptions(pagination: Pagination): SubscriptionsAction {
    return {
        type: ActionType.SUBSCRIPTIONS,
        API_CALL: {
            schema: Schemas.Users,
            endpoint: "users",
            queries: { "subscriptions": "true" },
            authenticated: true,
            pagination
        }
    }
}

export function loadSubscriptions(): SubscriptionsAction {
    return fetchSubscriptions({
        limit: "all",
        page: 1
    });
}

/******
 * AUTH
 ******/

// TODO: test api middleware integration!

export function postLogin(): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()
        dispatch(gaIdentify(CurrentUser.get(state, 'id')))
        dispatch(loadBookmarkedStacks("open"))
        dispatch(loadSubscriptions())
        dispatch(pushInitialize())
        dispatch(identifyEddy(CurrentUser.get(state, 'token')))
    }
}

function onLoginSuccessImmediate(store: Store, next: Dispatch, action: LoginAction, response: any) {
    store.dispatch({
        type: ActionType.ENTITY_UPDATE,
        response: normalize(response, Schemas.User)
    })
}

function onLoginSuccess(store: Store) {
    store.dispatch(postLogin())
}

interface LoginAction extends ApiCallAction {
    type: ActionType.LOGIN
}
function performLogin(username: string, password: string): LoginAction {
    return {
        type: ActionType.LOGIN,
        API_CALL: {
            endpoint: 'login',
            method: 'POST',
            body: {
                username,
                password
            },
            onSuccess: onLoginSuccess,
            onSuccessImmediate: onLoginSuccessImmediate
        }
    }
}

export function login(username: string, password: string): ThunkAction {
    return (dispatch, getState) => {
        // exit early if already logged in
        if (CurrentUser.isLoggedIn(getState())) {
            return null;
        }
        dispatch(performLogin(username, password))
    }
}


function onLogoutSuccess(store: Store) {
    store.dispatch(unidentifyEddy());
}

interface LogoutAction extends ApiCallAction {
    type: ActionType.LOGOUT
}
function performLogout(pushObject: PushSubscriptionObject): LogoutAction {
    return {
        type: ActionType.LOGOUT,
        API_CALL: {
            endpoint: 'logout',
            method: 'POST',
            body: pushObject,
            onSuccess: onLogoutSuccess
        }
    }
}

export function logout(): ThunkAction {
    return (dispatch, getState) => {
        // exit early if already logged out
        if (!CurrentUser.isLoggedIn(getState())) {
            return null;
        }

        let pushObject = Push.formattedPushObject(getState())
        dispatch(performLogout(pushObject))
    }
}


function onSignupSuccess(store: Store, next: Dispatch, action: SignupAction, response: any) {
    store.dispatch(login(action.credentials.username, action.credentials.password))

    store.dispatch(gaEvent({
        category: 'user',
        action: 'signup',
        label: response.username // todo: test
    }))
}

interface Credentials {
    email: string
    password: string
    username: string
}
interface SignupAction extends ApiCallAction {
    type: ActionType.SIGNUP
    credentials: Credentials
}
function performSignup(credentials: Credentials): SignupAction {
    return {
        type: ActionType.SIGNUP,
        credentials,
        API_CALL: {
            endpoint: 'signup',
            method: 'POST',
            body: credentials,
            onSuccess: onSignupSuccess 
        }
    }
}

/**************
 * SUBSCRIPTION
 **************/

function onSubscribeSuccess(store: Store, next: Dispatch, action: SubscribeAction) {
    const user = new UserEntity(action.id, store.getState().get('entities'))
    const newUser = {
        id: user.get('id'),
        subscriber_count: user.get('subscriber_count', 0) + 1
    }
    store.dispatch({
        type: ActionType.ENTITY_UPDATE,
        response: normalize(newUser, Schemas.User)
    })
    store.dispatch(gaEvent({
        category: 'user',
        action: 'subscribe',
        label: user.get('username')
    }))
}

interface SubscribeAction extends ApiCallAction {
    type: ActionType.SUBSCRIBE,
    id: number
}
function postSubscribe(subscription_id: number): SubscribeAction {
    return {
        type: ActionType.SUBSCRIBE,
        id: subscription_id,
        API_CALL: {
            method: 'POST',
            endpoint: `users/${subscription_id}/subscribe`,
            authenticated: true,
            onSuccess: onSubscribeSuccess
        }
    }
}

export function subscribe(user: UserEntity): ThunkAction {
    return (dispatch, getState) => {
        if (CurrentUser.get(getState(), 'id') === user.get('id')) {
            // can't subscribe to yourself
            return
        }
        dispatch(postSubscribe(user.get('id')))
    }
}

function onUnsubscribeSuccess(store: Store, next: Dispatch, action: UnsubscribeAction) {
    const user = new UserEntity(action.id, store.getState().get('entities'))
    const newUser = {
        id: user.get('id'),
        subscriber_count: user.get('subscriber_count', 0) - 1
    }
    store.dispatch({
        type: ActionType.ENTITY_UPDATE,
        response: normalize(newUser, Schemas.User)
    })
    store.dispatch(gaEvent({
        category: 'user',
        action: 'unsubscribe',
        label: user.get('username')
    }))
}

interface UnsubscribeAction extends ApiCallAction {
    type: ActionType.UNSUBSCRIBE,
    id: number
}
function postUnsubscribe(subscription_id: number): UnsubscribeAction {
    return {
        type: ActionType.UNSUBSCRIBE,
        id: subscription_id,
        API_CALL: {
            method: 'POST',
            endpoint: `users/${subscription_id}/unsubscribe`,
            authenticated: true,
            onSuccess: onUnsubscribeSuccess
        }
    }
}

export function unsubscribe(user: UserEntity): ThunkAction {
    return (dispatch, getState) => {
        if (CurrentUser.get(getState(), 'id') === user.get('id')) {
            // can't unsubscribe to yourself
            return
        }
        dispatch(postUnsubscribe(user.get('id')))
    }
}

/*******
 * RESET
 *******/

interface ClearLoginSignupAction extends GenericAction {
    type: ActionType.CLEAR_LOGIN_SIGNUP
}
function clearLoginSignup(): ClearLoginSignupAction {
    return {
        type: ActionType.CLEAR_LOGIN_SIGNUP
    }
}

export function clearLogin() {
    return clearLoginSignup()
}

export function clearSignup() {
    return clearLoginSignup()
}

interface ClearClosedBookmarkedStacksAction extends GenericAction {
    type: ActionType.CLEAR_CLOSED_BOOKMARKED_STACKS
    stackStatus: StackStatus
}
export function clearClosedBookmarkedStacks(): ClearClosedBookmarkedStacksAction {
    return {
        type: ActionType.CLEAR_CLOSED_BOOKMARKED_STACKS,
        stackStatus: 'closed'
    }
}
