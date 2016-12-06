import assign from 'lodash/assign'
import flatten from 'lodash/flatten'
import { normalize } from 'normalizr'

import ActionTypes from './types'
import Schemas from '../schemas'
import { loadPaginatedObjects } from './utils'
import { API_CALL, API_CANCEL } from './types'

/**********
 * FETCHING
 **********/

function onHomeSuccess(store, next, action, response) {
    const stacks = response.map(s => s.stacks)
    next({
        type: ActionTypes.ENTITY_UPDATE,
        response: normalize(flatten(stacks), Schemas.STACKS)
    })
}

function fetchHome() {
    return {
        type: ActionTypes.HOME,
        [API_CALL]: {
            endpoint: "home",
            onSuccessImmediate: onHomeSuccess
        }
    }
}

export function loadHome() {
    return fetchHome()
}

/*******
 * RESET
 *******/

export function clearHome() {
    return {
        type: ActionTypes.CLEAR_HOME,
        [API_CANCEL]: {
            actionTypes: [ActionTypes.HOME]
        }
    }
}
