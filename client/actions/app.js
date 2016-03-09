import { assign } from 'lodash'

import ActionTypes from './types'
import Schemas from '../schemas'
import { API_CALL } from '../middleware/api'

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
        type: CLEAR_APP
    }
}