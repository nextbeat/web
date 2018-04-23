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

export type CommunityActionAll = any

/******
 * LOAD
 ******/

interface ModeratorsAction extends ApiCallAction {
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

/********
 * UPDATE
 ********/

interface AddModeratorAction extends ApiCallAction {
    type: ActionType.ADD_MODERATOR
    creatorId: number
    username: string
}
function performAddModerator(creatorId: number, username: string): AddModeratorAction {
    return {
        type: ActionType.ADD_MODERATOR,
        creatorId,
        username,
        API_CALL: {
            endpoint: `users/${creatorId}/mod`,
            method: 'POST',
            body: { username }
        }
    }
}

export function addModerator(username: string): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()

        if (!CurrentUser.isLoggedIn(state)) {
            return null;
        }

        dispatch(performAddModerator(CurrentUser.get(state, 'id'), username))
    }
}

interface RemoveModeratorAction extends ApiCallAction {
    type: ActionType.REMOVE_MODERATOR
    creatorId: number
    username: string
}
function performRemoveModerator(creatorId: number, username: string): RemoveModeratorAction {
    return {
        type: ActionType.REMOVE_MODERATOR,
        creatorId,
        username,
        API_CALL: {
            endpoint: `users/${creatorId}/unmod`,
            method: 'POST',
            body: { username }
        }
    }
}

export function removeModerator(username: string): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()

        if (!CurrentUser.isLoggedIn(state)) {
            return null;
        }

        dispatch(performRemoveModerator(CurrentUser.get(state, 'id'), username))
    }
}

/*******
 * CLEAR
 *******/

interface ClearModeratorsAction extends ApiCancelAction {
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