import ActionTypes from './types'

export function connectEddy() {
    return {
        type: ActionTypes.CONNECT_EDDY
    }
}

export function disconnectEddy() {
    return {
        type: ActionTypes.DISCONNECT_EDDY
    }
}

export function identifyEddy(token) {
    return {
        type: ActionTypes.IDENTIFY_EDDY,
        token
    }
}

export function unidentifyEddy() {
    return {
        type: ActionTypes.UNIDENTIFY_EDDY
    }
}