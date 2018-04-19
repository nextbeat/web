import assign from 'lodash-es/assign'

import { 
    ActionType, 
    ApiCallAction, 
    ApiCancelAction,
    GenericAction,
    ThunkAction
} from '@actions/types'
import CurrentUser from '@models/state/currentUser'
import EditProfile from '@models/state/pages/creator/editProfile'

export type EditProfileActionAll = 
    EditProfileAction |
    UpdateEditProfileAction |
    SubmitEditProfileAction |
    ClearEditProfileAction

/******
 * LOAD
 ******/

interface UserObject {
    uuid: string
    fullName: string
    bio: string
    website: string
}
export interface EditProfileAction extends GenericAction {
    type: ActionType.EDIT_PROFILE
    userId: number
    userObject: Partial<UserObject>
}
function performEditProfile(userId: number, userObject: Partial<UserObject>): EditProfileAction {
    return {
        type: ActionType.EDIT_PROFILE,
        userId,
        userObject
    }
}

export function loadEditProfile(): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()
        if (!CurrentUser.isLoggedIn(state)) {
            return null;
        }

        let userObject = {}
        if (CurrentUser.get(state, 'hasUpdatedEntity')) {
            assign(userObject, {
                fullName: CurrentUser.entity(state).get('full_name'),
                bio: CurrentUser.entity(state).get('description'),
                website: CurrentUser.entity(state).get('website_url')
            })
        }

        return dispatch(performEditProfile(CurrentUser.get(state, 'id'), userObject))
    }
}


/********
 * UPDATE
 ********/

export interface UpdateEditProfileAction extends GenericAction {
    type: ActionType.UPDATE_EDIT_PROFILE
    userObject: Partial<UserObject>
}
export function updateEditProfile(fields: Partial<UserObject>): UpdateEditProfileAction {
    return {
        type: ActionType.UPDATE_EDIT_PROFILE,
        userObject: fields
    }
}

export interface SubmitEditProfileAction extends ApiCallAction {
    type: ActionType.SUBMIT_EDIT_PROFILE
}
function postSubmitEditProfile(userObject: Partial<UserObject>): SubmitEditProfileAction {
    return {
        type: ActionType.SUBMIT_EDIT_PROFILE,
        API_CALL: {
            method: 'PUT',
            endpoint: `users/${userObject.uuid}`,
            body: userObject
        }
    }
}

export function submitEditProfile(): ThunkAction {
    return (dispatch, getState) => {
        let submitObject = EditProfile.userSubmitObject(getState())
        return dispatch(postSubmitEditProfile(submitObject))
    }
}


/*******
 * CLEAR
 *******/

export interface ClearEditProfileAction extends ApiCancelAction {
    type: ActionType.CLEAR_EDIT_PROFILE
}
export function clearEditProfile(): ClearEditProfileAction {
    return {
        type: ActionType.CLEAR_EDIT_PROFILE,
        API_CANCEL: {
            actionTypes: [ActionType.SUBMIT_EDIT_PROFILE]
        }
    }
}