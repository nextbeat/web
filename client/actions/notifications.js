import assign from 'lodash/assign'

import { Status } from './types'
import ActionTypes from './types'
import { CurrentUser, Notifications, RoomPage } from '../models'
import Schemas from '../schemas'
import { API_CALL, API_CANCEL } from './types'

/*******************
 * FETCHING ACTIVITY
 *******************/

function fetchActivity() {
    return {
        type: ActionTypes.ACTIVITY,
        [API_CALL]: {
            endpoint: "activity",
            authenticated: true
        }
    }
}

export function loadActivity() {
    // todo: pagination?
    return fetchActivity();
}


/*******
 * CLEAR
 *******/

export function clearNotifications() {
    return {
        type: ActionTypes.CLEAR_NOTIFICATIONS,
        [API_CANCEL]: {
            actionTypes: [ActionTypes.NOTIFICATIONS]
        }
    }
}