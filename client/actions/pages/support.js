import ActionTypes from '../types'
import { API_CALL } from '../types'

export function validatePasswordResetToken(token) {
    return {
        type: ActionTypes.VALIDATE_PASSWORD_RESET_TOKEN,
        [API_CALL]: {
            endpoint: 'support/validate-password-reset-token',
            method: 'POST',
            body: { token }
        }
    }
}

export function resetPassword(password, passwordConfirm, token) {
    return {
        type: ActionTypes.RESET_PASSWORD,
        [API_CALL]: {
            endpoint: 'support/password-reset',
            method: 'POST',
            body: { password, passwordConfirm, token }
        }
    }
}

export function sendPasswordResetRequest(email) {
    return {
        type: ActionTypes.SEND_PASSWORD_RESET_REQUEST,
        [API_CALL]: {
            endpoint: 'support/password-reset-request',
            method: 'POST',
            body: { email }
        }
    }
}

export function sendEmailUnsubscribeRequest(uuid, signature) {
    return {
        type: ActionTypes.SEND_EMAIL_UNSUBSCRIBE_REQUEST,
        [API_CALL]: {
            endpoint: 'support/unsubscribe',
            method: 'POST',
            body: {
                uuid,
                signature
            }
        }
    }
}