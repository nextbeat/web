import { assign } from 'lodash'

import ActionTypes from './types'
import { GA, GATypes } from './types'

/***********
 * ANALYTICS
 ***********/

export function gaIdentify(user) {
    return {
        type: ActionTypes.GA,
        [GA]: {
            type: GATypes.IDENTIFY,
            user
        }
    }
}

export function gaPage() {
    return {
        type: ActionTypes.GA,
        [GA]: {
            type: GATypes.PAGE
        }
    }
}

export function gaEvent(data, cb, timeout=1000) {
    return {
        type: ActionTypes.GA,
        [GA]: assign({}, data, {
            type: GATypes.EVENT,
            callback: cb,
            timeout
        })
    }
}