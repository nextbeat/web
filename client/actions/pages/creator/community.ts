import { 
    ActionType, 
    ApiCallAction, 
    ApiCancelAction,
    GenericAction,
    ThunkAction,
    ApiCall,
    Action
} from '@actions/types'
import { triggerAuthError } from '@actions/app'

import CurrentUser from '@models/state/currentUser'
import * as Schemas from '@schemas'

export type CommunityActionAll = 
    ModeratorsAction |
    ClearModeratorsAction

/******
 * LOAD
 ******/

export interface ModeratorsAction extends ApiCallAction {
    type: ActionType.MODERATORS,
    creatorId: number
}
function fetchModerators(creatorId: number): ModeratorsAction {
    return {
        type: ActionType.MODERATORS,
        creatorId,
        API_CALL: {
            endpoint: `users/${creatorId}/moderators`,
            schema: Schemas.Users
        }
    }
}

export function loadModerators(): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()

        if (!CurrentUser.isLoggedIn(state)) {
            return null;
        }

        dispatch(fetchModerators(CurrentUser.get(state, 'id')))
    }
}

/*******
 * CLEAR
 *******/

export interface ClearModeratorsAction extends ApiCancelAction {
    type: ActionType.CLEAR_MODERATORS
}

export function clearModerators(): ApiCancelAction {
    return {
        type: ActionType.CLEAR_MODERATORS,
        API_CANCEL: {
            actionTypes: [ActionType.CLEAR_MODERATORS, ActionType.ADD_MODERATOR, ActionType.REMOVE_MODERATOR]
        }
    }
}