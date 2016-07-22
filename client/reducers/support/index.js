import { Map } from 'immutable'
import { ActionTypes, Status } from '../../actions'

function validatePasswordResetToken(state, action) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isValidatingToken: true
            }).delete('tokenValidated')
        case Status.SUCCESS:
            return state.merge({
                isValidatingToken: false,
                tokenValidated: true,
                tokenUsername: action.response.username
            })
        case Status.FAILURE:
            return state.merge({
                isValidatingToken: false,
                tokenValidated: false,
                tokenError: action.error
            })
    }
    return state
}

function resetPassword(state, action) {
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
                passwordResetError: action.error
            })
    }
    return state;
}

function sendPasswordResetRequest(state, action) {
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
                resetRequestError: action.error
            })
    }
    return state;
}

function sendEmailUnsubscribeRequest(state, action) {
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

export default function(state=Map(), action) {
    switch (action.type) {
        case ActionTypes.VALIDATE_PASSWORD_RESET_TOKEN:
            return validatePasswordResetToken(state, action)
        case ActionTypes.RESET_PASSWORD:
            return resetPassword(state, action)
        case ActionTypes.SEND_PASSWORD_RESET_REQUEST:
            return sendPasswordResetRequest(state, action)
        case ActionTypes.SEND_EMAIL_UNSUBSCRIBE_REQUEST:
            return sendEmailUnsubscribeRequest(state, action)
    }
    return state;
}