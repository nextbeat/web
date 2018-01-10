import { ActionType, ApiCallAction, ApiCancelAction } from '@actions/types'

export type CompanyActionAll = 
    SubmitContactMessageAction |
    ClearCompanyAction

interface MessageObject {
    name?: string
    email?: string
    phone?: string
    company?: string
    message?: string
}

export interface SubmitContactMessageAction extends ApiCallAction {
    type: ActionType.SUBMIT_CONTACT_MESSAGE
}
export function submitContactMessage(messageObject: MessageObject): SubmitContactMessageAction {
    return {
        type: ActionType.SUBMIT_CONTACT_MESSAGE,
        API_CALL: {
            endpoint: 'support/contact',
            method: 'POST',
            body: messageObject
        }
    }
}

export interface ClearCompanyAction extends ApiCancelAction {
    type: ActionType.CLEAR_COMPANY
}
export function clearCompany(): ClearCompanyAction {
    return {
        type: ActionType.CLEAR_COMPANY,
        API_CANCEL: {
            actionTypes: [ActionType.SUBMIT_CONTACT_MESSAGE]
        }
    }
}
