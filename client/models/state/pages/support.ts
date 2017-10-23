import { StateModelFactory } from '@models/state/base'

interface SupportProps {
    isValidatingToken: boolean
    tokenValidated: boolean
    tokenUsername: string
    tokenError: string
    isResettingPassword: boolean
    passwordReset: boolean
    passwordResetError: Error
    isSendingResetRequest: boolean
    resetRequestSent: boolean
    resetRequestError: Error
    isSendingUnsubscribeRequest: boolean
    unsubscribeRequestSent: boolean
    unsubscribeRequestError: string
}

const keyMap = {
    'isValidatingToken': ['isValidatingToken'],
    'tokenValidated': ['tokenValidated'],
    'tokenUsername': ['tokenUsername'],
    'tokenError': ['tokenError'],
    'isResettingPassword': ['isResettingPassword'],
    'passwordReset': ['passwordReset'],
    'passwordResetError': ['passwordResetError'],
    'isSendingResetRequest': ['isSendingResetRequest'],
    'resetRequestSent': ['resetRequestSent'],
    'resetRequestError': ['resetRequestError'],
    'isSendingUnsubscribeRequest': ['isSendingUnsubscribeRequest'],
    'unsubscribeRequestSent': ['unsubscribeRequestSent'],
    'unsubscribeRequestError': ['unsubscribeRequestError']
}

const keyMapPrefix = ['pages', 'support']

export default class Support extends StateModelFactory<SupportProps>(keyMap, keyMapPrefix){}