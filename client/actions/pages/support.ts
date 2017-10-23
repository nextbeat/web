import { ActionType, ApiCallAction } from '@actions/types'

export type SupportActionAll = 
    ValidatePasswordResetTokenAction |
    ResetPasswordAction |
    SendPasswordResetRequestAction |
    SendEmailUnsubscribeRequestAction 

interface ValidatePasswordResetTokenAction extends ApiCallAction {
    type: ActionType.VALIDATE_PASSWORD_RESET_TOKEN
}
export function validatePasswordResetToken(token: string): ValidatePasswordResetTokenAction {
    return {
        type: ActionType.VALIDATE_PASSWORD_RESET_TOKEN,
        API_CALL: {
            endpoint: 'support/validate-password-reset-token',
            method: 'POST',
            body: { token }
        }
    }
}

interface ResetPasswordAction extends ApiCallAction {
    type: ActionType.RESET_PASSWORD
}
export function resetPassword(password: string, passwordConfirm: string, token: string): ResetPasswordAction {
    return {
        type: ActionType.RESET_PASSWORD,
        API_CALL: {
            endpoint: 'support/password-reset',
            method: 'POST',
            body: { 
                password, 
                passwordConfirm, 
                token 
            }
        }
    }
}

interface SendPasswordResetRequestAction extends ApiCallAction {
    type: ActionType.SEND_PASSWORD_RESET_REQUEST
}
export function sendPasswordResetRequest(email: string): SendPasswordResetRequestAction {
    return {
        type: ActionType.SEND_PASSWORD_RESET_REQUEST,
        API_CALL: {
            endpoint: 'support/password-reset-request',
            method: 'POST',
            body: { email }
        }
    }
}

interface SendEmailUnsubscribeRequestAction extends ApiCallAction {
    type: ActionType.SEND_EMAIL_UNSUBSCRIBE_REQUEST
}
export function sendEmailUnsubscribeRequest(uuid: string, signature: string): SendEmailUnsubscribeRequestAction {
    return {
        type: ActionType.SEND_EMAIL_UNSUBSCRIBE_REQUEST,
        API_CALL: {
            endpoint: 'support/unsubscribe',
            method: 'POST',
            body: {
                uuid,
                signature
            }
        }
    }
}