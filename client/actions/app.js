import { assign } from 'lodash'

import ActionTypes from './types'
import Schemas from '../schemas'
import { API_CALL, API_CANCEL } from './types'

/**********
 * FETCHING
 **********/

function fetchChannels() {
    return {
        type: ActionTypes.CHANNELS,
        [API_CALL]: {
            schema: Schemas.CHANNELS,
            endpoint: "channels",
        }
    }
}

export function loadChannels() {
    return fetchChannels();
}

export function clearApp() {
    return {
        type: ActionTypes.CLEAR_APP
    }
}