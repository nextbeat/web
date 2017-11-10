import { Map } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { 
    ValidatePasswordResetTokenAction, 
    ResetPasswordAction, 
    SendPasswordResetRequestAction, 
    SendEmailUnsubscribeRequestAction 
} from '@actions/pages/support'
import { State } from '@types'

function validatePasswordResetToken(state: State, action: ValidatePasswordResetTokenAction) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isValidatingToken: true
            }).delete('tokenValidated')
        case Status.SUCCESS:
            return state.merge({
                isValidatingToken: false,
                tokenValidated: true,
                tokenUsername: (action.response as any).username
            })
        case Status.FAILURE:
            return state.merge({
                isValidatingToken: false,
                tokenValidated: false,
                tokenError: action.error.message
            })
    }
    return state
}

function resetPassword(state: State, action: ResetPasswordAction) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isResettingPassword: true
            }).delete('passwordReset')
        case Status.SUCCESS:
            return state.merge({
                isResettingPassword: false,
                passwordReset: true
            })
        case Status.FAILURE:
            return state.merge({
                isResettingPassword: false,
                passwordReset: false,
                passwordResetError: action.error.message
            })
    }
    return state;
}

function sendPasswordResetRequest(state: State, action: SendPasswordResetRequestAction) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isSendingResetRequest: true
            }).delete('resetRequestSent')
        case Status.SUCCESS:
            return state.merge({
                isSendingResetRequest: false,
                resetRequestSent: true
            })
        case Status.FAILURE:
            return state.merge({
                isSendingResetRequest: false,
                resetRequestSent: false,
                resetRequestError: action.error.message
            })
    }
    return state;
}

function sendEmailUnsubscribeRequest(state: State, action: SendEmailUnsubscribeRequestAction) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isSendingUnsubscribeRequest: true
            }).delete('unsubscribeRequestSent')
        case Status.SUCCESS:
            return state.merge({
                isSendingUnsubscribeRequest: false,
                unsubscribeRequestSent: true
            })
        case Status.FAILURE:
            return state.merge({
                isSendingUnsubscribeRequest: false,
                unsubscribeRequestSent: false,
                unsubscribeRequestError: "Bad request."
            })
    }
    return state;
}

export default function(state=Map<string, any>(), action: Action) {
    switch (action.type) {
        case ActionType.VALIDATE_PASSWORD_RESET_TOKEN:
            return validatePasswordResetToken(state, action)
        case ActionType.RESET_PASSWORD:
            return resetPassword(state, action)
        case ActionType.SEND_PASSWORD_RESET_REQUEST:
            return sendPasswordResetRequest(state, action)
        case ActionType.SEND_EMAIL_UNSUBSCRIBE_REQUEST:
            return sendEmailUnsubscribeRequest(state, action)
    }
    return state;
}