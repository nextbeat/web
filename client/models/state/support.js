import StateModel from './base'

const KEY_MAP = {
    'isValidatingToken': ['support', 'isValidatingToken'],
    'tokenValidated': ['support', 'tokenValidated'],
    'tokenUsername': ['support', 'tokenUsername'],
    'tokenError': ['support', 'tokenError'],
    'isResettingPassword': ['support', 'isResettingPassword'],
    'passwordReset': ['support', 'passwordReset'],
    'passwordResetError': ['support', 'passwordResetError'],
    'isSendingResetRequest': ['support', 'isSendingResetRequest'],
    'resetRequestSent': ['support', 'resetRequestSent'],
    'resetRequestError': ['support', 'resetRequestError'],
    'isSendingUnsubscribeRequest': ['support', 'isSendingUnsubscribeRequest'],
    'unsubscribeRequestSent': ['support', 'unsubscribeRequestSent'],
    'unsubscribeRequestError': ['support', 'unsubscribeRequestError']
}

export default class Support extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "support";
    }
    
}