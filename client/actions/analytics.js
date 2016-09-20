import { assign } from 'lodash'

import ActionTypes from './types'
import { ANALYTICS, AnalyticsTypes } from './types'

/***********
 * ANALYTICS
 ***********/

export function analyticsIdentify(user) {
    return {
        type: ActionTypes.ANALYTICS,
        [ANALYTICS]: {
            type: AnalyticsTypes.IDENTIFY,
            user
        }
    }
}

export function analyticsPage() {
    return {
        type: ActionTypes.ANALYTICS,
        [ANALYTICS]: {
            type: AnalyticsTypes.PAGE
        }
    }
}

export function analyticsEvent(data) {
    return {
        type: ActionTypes.ANALYTICS,
        [ANALYTICS]: assign({}, data, {
            type: AnalyticsTypes.EVENT
        })
    }
}