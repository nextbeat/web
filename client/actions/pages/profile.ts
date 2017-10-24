import { 
    ActionType, 
    ApiCallAction, 
    ApiCancelAction,
    ThunkAction,
    Pagination 
} from '@actions/types'
import * as Schemas from '@schemas'
import { loadPaginatedObjects } from '@actions/utils'
import Profile from '@models/state/pages/profile'
import { Store, Dispatch } from '@types'

export type ProfileActionAll = 
    ProfileAction |
    UserStacksAction |
    ClearProfileAction

/**********
 * FETCHING
 **********/

function onProfileSuccess(store: Store, next: Dispatch, action: ProfileAction, response: any) {
    const profile = response.entities.users[response.result];
    store.dispatch(loadStacksForUser(profile.username))
}

export interface ProfileAction extends ApiCallAction {
    type: ActionType.USER
}
export function loadProfile(username: string) {
    return {
        type: ActionType.USER,
        API_CALL: {
            schema: Schemas.User,
            endpoint: `users/${username}`,
            onSuccessImmediate: onProfileSuccess
        }
    }
}

export interface UserStacksAction extends ApiCallAction {
    type: ActionType.USER_STACKS
}
function fetchStacksForUser(username: string, pagination: Pagination) {
    return {
        type: ActionType.USER_STACKS,
        API_CALL: {
            schema: Schemas.Stacks,
            endpoint: "stacks",
            queries: { author: username, status: "all" },
            pagination
        }
    }
}

export function loadStacksForUser(username: string): ThunkAction {
     return (dispatch, getState) => {
        if (!username) {
            username = Profile.entity(getState()).get('username')
        }
        const fetchFn = fetchStacksForUser.bind(this, username)
        loadPaginatedObjects(['pages', 'profile', 'pagination', 'stacks'], fetchFn, 24)(dispatch, getState);
    }
}


/*******
 * RESET
 *******/

export interface ClearProfileAction extends ApiCancelAction {
    type: ActionType.CLEAR_PROFILE
}
export function clearProfile() {
    return {
        type: ActionType.CLEAR_PROFILE,
        API_CANCEL: {
            actionTypes: [ActionType.USER_STACKS, ActionType.USER]
        }
    }
}
