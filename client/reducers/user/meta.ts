import { Map } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import {
    LoginAction,
    LogoutAction,
    SignupAction,
    ClearLoginSignupAction,
    BookmarkedStacksAction,
    SubscriptionsAction
} from '@actions/user'
import { State } from '@types'

function login(state: State, action: LoginAction) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isLoggingIn: true
            }).delete('loginError')
        case Status.SUCCESS:
            return state.merge({
                isLoggingIn: false,
                id: (action.response as any).id,
                token: (action.response as any).token,
            })
        case Status.FAILURE:
            return state.merge({
                isLoggingIn: false,
                loginError: action.error.message
            })
    }
    return state
}

function logout(state: State, action: LogoutAction) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isLoggingOut: true
            })
        case Status.SUCCESS:
            return state.set('isLoggingOut', false)
                .delete('id')
                .delete('token')
                .delete('username')
                .delete('hasUpdatedEntity')
        case Status.FAILURE:
            return state.merge({
                isLoggingOut: false
            })
    }
    return state
}

function signup(state: State, action: SignupAction) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isSigningUp: true
            }).delete('signupError')
        case Status.SUCCESS:
            return state.merge({
                isSigningUp: false
            })
        case Status.FAILURE:
            return state.merge({
                isSigningUp: false,
                signupError: action.error.message
            })
    }
    return state
}

function clearLoginSignup(state: State, action: ClearLoginSignupAction) {
    return state.merge({
        isSigningUp: false,
        isLoggingIn: false,
        hasUpdatedEntity: false,
    }).delete('loginError').delete('signupError');
}

function entityUpdate(state: State, action: Action) {
    let users = action.response.entities.users
    if (users && state.get('id') > 0 && state.get('id') in users) {
        return state.merge({
            hasUpdatedEntity: true
        })
    }
    return state
}

function bookmarkedStacks(state: State, action: BookmarkedStacksAction) {
    if (action.status === Status.SUCCESS && action.stackStatus === 'open') {
        return state.set('loadedBookmarkedStacks', true)
    }
    return state
}

function subscriptions(state: State, action: SubscriptionsAction) {
    if (action.status === Status.SUCCESS) {
        return state.set('loadedSubscriptions', true)
    }
    return state
}

export default function meta(state=Map<string, any>(), action: Action) {
    if (action.type === ActionType.LOGIN) {
        return login(state, action)
    } else if (action.type === ActionType.LOGOUT) {
        return logout(state, action)
    } else if (action.type === ActionType.SIGNUP) {
        return signup(state, action)
    } else if (action.type === ActionType.CLEAR_LOGIN_SIGNUP) {
        return clearLoginSignup(state, action)
    } else if (action.type === ActionType.ENTITY_UPDATE) {
        return entityUpdate(state, action)
    } else if (action.type === ActionType.BOOKMARKED_STACKS) {
        return bookmarkedStacks(state, action)
    } else if (action.type === ActionType.SUBSCRIPTIONS) {
        return subscriptions(state, action)
    }
    return state;
}
