import StateModel from '../base'

const KEY_MAP = {
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

export default class Support extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['pages', 'support'];
    }
    
}