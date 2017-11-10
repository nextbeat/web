import flatten from 'lodash-es/flatten'
import { normalize } from 'normalizr'

import { ActionType, ApiCallAction, ApiCancelAction } from '@actions/types'
import * as Schemas from '@schemas'
import { Store, Dispatch } from '@types'

export type HomeActionAll = 
    HomeAction |
    ClearHomeAction

/**********
 * FETCHING
 **********/

function onHomeSuccess(store: Store, next: Dispatch, action: HomeAction, response: any) {
    const stacks = response.sections.map((s: any) => s.stacks)
    next({
        type: ActionType.ENTITY_UPDATE,
        response: normalize(flatten(stacks), Schemas.Stacks)
    })
    next({
        type: ActionType.ENTITY_UPDATE,
        response: normalize(response.main_card, Schemas.Stack)
    })
}

export interface HomeAction extends ApiCallAction {
    type: ActionType.HOME
}
function fetchHome(): HomeAction {
    return {
        type: ActionType.HOME,
        API_CALL: {
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

export interface ClearHomeAction extends ApiCallAction {
    type: ActionType.CLEAR_HOME
}
export function clearHome() {
    return {
        type: ActionType.CLEAR_HOME,
        API_CANCEL: {
            actionTypes: [ActionType.HOME]
        }
    }
}
