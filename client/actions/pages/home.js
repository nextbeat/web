import assign from 'lodash/assign'
import flatten from 'lodash/flatten'
import { normalize } from 'normalizr'

import ActionTypes from '../types'
import Schemas from '../../schemas'
import { API_CALL, API_CANCEL } from '../types'

/**********
 * FETCHING
 **********/

function onHomeSuccess(store, next, action, response) {
    const stacks = response.sections.map(s => s.stacks)
    next({
        type: ActionTypes.ENTITY_UPDATE,
        response: normalize(flatten(stacks), Schemas.STACKS)
    })
    next({
        type: ActionTypes.ENTITY_UPDATE,
        response: normalize(response.main_card, Schemas.STACK)
    })
}

function fetchHome() {
    return {
        type: ActionTypes.HOME,
        [API_CALL]: {
            endpoint: "home/v2",
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
