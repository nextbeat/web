import { assign } from 'lodash'

import ActionTypes from './types'
import Schemas from '../schemas'
import { API_CALL, API_CANCEL } from './types'

/**********
 * FETCHING
 **********/

function fetchTags() {
    return {
        type: ActionTypes.TAGS,
        [API_CALL]: {
            schema: Schemas.TAGS,
            endpoint: "tags",
        }
    }
}

export function loadTags() {
    return fetchTags();
}

export function clearApp() {
    return {
        type: ActionTypes.CLEAR_APP
    }
}