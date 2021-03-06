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
    GetCurrentUserAction |
    LoginAction |
    LogoutAction |
    SignupAction |
    RevokeSocialAccountAction |
    SubscribeAction |
    UnsubscribeAction |
    CreatorBanAction |
    CreatorUnbanAction |
    ModAction |
    UnmodAction |
    ClearLoginSignupAction |
    ClearClosedBookmarkedStacksAction 
    

/******
 * SYNC
 ******/

export interface SyncStacksAction extends ApiCallAction {
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

export interface BookmarkedStacksAction extends ApiCallAction {
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

export interface SubscriptionsAction extends ApiCallAction {
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

export interface GetCurrentUserAction extends ApiCallAction {
    type: ActionType.GET_CURRENT_USER
}
function fetchCurrentUser(username: string): GetCurrentUserAction {
    return {
        type: ActionType.GET_CURRENT_USER,
        API_CALL: {
            schema: Schemas.User,
            endpoint: `users/${username}`,
            authenticated: true
        }
    }
}

export function getCurrentUser(): ThunkAction {
    return (dispatch, getState) => {
        if (!CurrentUser.isLoggedIn(getState())) {
            return;
        }

        const username = CurrentUser.entity(getState()).get('username')
        dispatch(fetchCurrentUser(username))
    }
}

/******
 * AUTH
 ******/

export function postLogin(): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()
        dispatch(gaIdentify(CurrentUser.entity(state).get('gaid')))
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

export interface LoginAction extends ApiCallAction {
    type: ActionType.LOGIN
}
function performLogin(username: string, password: string): LoginAction {
    return {
        type: ActionType.LOGIN,
        API_CALL: {
            endpoint: '/login',
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

export interface LogoutAction extends ApiCallAction {
    type: ActionType.LOGOUT
}
function performLogout(pushObject?: PushSubscriptionObject): LogoutAction {
    return {
        type: ActionType.LOGOUT,
        API_CALL: {
            endpoint: '/logout',
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

        let pushObject = Push.formattedPushObject(getState()) || undefined
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
export interface SignupAction extends ApiCallAction {
    type: ActionType.SIGNUP
    credentials: Credentials
}
function performSignup(credentials: Credentials): SignupAction {
    return {
        type: ActionType.SIGNUP,
        credentials,
        API_CALL: {
            endpoint: '/signup',
            method: 'POST',
            body: credentials,
            onSuccess: onSignupSuccess 
        }
    }
}

export function signup(credentials: Credentials): ThunkAction {
    return (dispatch, getState) => {
        // exit early if already logged in
        if (CurrentUser.isLoggedIn(getState())) {
            return null;
        }
        dispatch(performSignup(credentials))
    }
}

/********
 * SOCIAL
 ********/

function onRevokeSocialAccountSuccess(store: Store, next: Dispatch, action: RevokeSocialAccountAction) {
    // Refresh current user serialization to get updated social accounts
    store.dispatch(getCurrentUser())
}

export interface RevokeSocialAccountAction extends ApiCallAction {
    type: ActionType.REVOKE_SOCIAL_ACCOUNT
    platform: string
}
export function revokeSocialAccount(platform: string): RevokeSocialAccountAction {
    return {
        type: ActionType.REVOKE_SOCIAL_ACCOUNT,
        platform,
        API_CALL: {
            endpoint: `social/${platform}/auth/revoke`,
            method: 'POST',
            onSuccess: onRevokeSocialAccountSuccess
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

export interface SubscribeAction extends ApiCallAction {
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

export function subscribe(userId: number): ThunkAction {
    return (dispatch, getState) => {
        if (CurrentUser.get(getState(), 'id') === userId) {
            // can't subscribe to yourself
            return
        }
        dispatch(postSubscribe(userId))
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

export interface UnsubscribeAction extends ApiCallAction {
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

export function unsubscribe(userId: number): ThunkAction {
    return (dispatch, getState) => {
        if (CurrentUser.get(getState(), 'id') === userId) {
            // can't unsubscribe to yourself
            return
        }
        dispatch(postUnsubscribe(userId))
    }
}

/***********
 * COMMUNITY
 ***********/

// todo: move elsewhere

export interface CreatorBanAction extends GenericAction {
    type: ActionType.CREATOR_BAN
    creatorId: number
    roomId?: number
    username: string
}
export function creatorBan(creatorId: number, username: string, roomId?: number): CreatorBanAction {
    return {
        type: ActionType.CREATOR_BAN,
        creatorId,
        username,
        roomId
    }
}

export interface CreatorUnbanAction extends GenericAction {
    type: ActionType.CREATOR_UNBAN
    creatorId: number
    roomId?: number
    username: string
}
export function creatorUnban(creatorId: number, username: string, roomId?: number): CreatorUnbanAction {
    return {
        type: ActionType.CREATOR_UNBAN,
        creatorId,
        username,
        roomId
    }
}

export interface ModAction extends GenericAction {
    type: ActionType.MOD
    creatorId: number
    roomId?: number
    username: string
}
export function mod(creatorId: number, username: string, roomId?: number): ModAction {
    return {
        type: ActionType.MOD,
        creatorId,
        username,
        roomId
    }
}

export interface UnmodAction extends GenericAction {
    type: ActionType.UNMOD
    creatorId: number
    roomId?: number
    username: string
}
export function unmod(creatorId: number, username: string, roomId?: number): UnmodAction {
    return {
        type: ActionType.UNMOD,
        creatorId,
        username,
        roomId
    }
}

/*******
 * RESET
 *******/

export interface ClearLoginSignupAction extends GenericAction {
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

export interface ClearClosedBookmarkedStacksAction extends GenericAction {
    type: ActionType.CLEAR_CLOSED_BOOKMARKED_STACKS
    stackStatus: StackStatus
}
export function clearClosedBookmarkedStacks(): ClearClosedBookmarkedStacksAction {
    return {
        type: ActionType.CLEAR_CLOSED_BOOKMARKED_STACKS,
        stackStatus: 'closed'
    }
}
