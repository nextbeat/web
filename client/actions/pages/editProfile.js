import assign from 'lodash/assign'

import ActionTypes from '../types'
import { API_CALL, API_CANCEL } from '../types'
import { CurrentUser, EditProfile } from '../../models'


/******
 * LOAD
 ******/

function performEditProfile(userId, userObject) {
    return {
        type: ActionTypes.EDIT_PROFILE,
        userId,
        userObject
    }
}

export function loadEditProfile() {
    return (dispatch, getState) => {
        let currentUser = new CurrentUser(getState())
        if (!currentUser.isLoggedIn()) {
            return null;
        }

        let userObject = {}
        if (currentUser.get('hasUpdatedEntity')) {
            assign(userObject, {
                fullName: currentUser.get('full_name'),
                bio: currentUser.get('description'),
                website: currentUser.get('website_url')
            })
        }

        return dispatch(performEditProfile(currentUser.get('id'), userObject))
    }
}


/********
 * UPDATE
 ********/

export function updateEditProfile(fields) {
    return {
        type: ActionTypes.UPDATE_EDIT_PROFILE,
        userObject: fields
    }
}

function postSubmitEditProfile(userObject) {
    return {
        type: ActionTypes.SUBMIT_EDIT_PROFILE,
        [API_CALL]: {
            method: 'PUT',
            endpoint: `users/${userObject.uuid}`,
            body: userObject
        }
    }
}

export function submitEditProfile() {
    return (dispatch, getState) => {
        let editProfile = new EditProfile(getState())
        console.log(editProfile.userSubmitObject())
        return dispatch(postSubmitEditProfile(editProfile.userSubmitObject()))
    }
}


/*******
 * CLEAR
 *******/

export function clearEditProfile() {
    return {
        type: ActionTypes.CLEAR_EDIT_PROFILE,
        [API_CANCEL]: {
            actionTypes: [ActionTypes.SUBMIT_EDIT_PROFILE]
        }
    }
}