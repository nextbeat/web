import { Map, fromJS } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { combineReducers } from '@reducers/utils'
import { State } from '@types'
import { UploadType } from '@upload'

function meta(state=Map(), action: Action) {
    if (action.type === ActionType.EDIT_PROFILE) {
        return state.get('id', action.userId)
    }
    return state
}

function fields(state=Map(), action: Action) {
    if (action.type === ActionType.EDIT_PROFILE 
        || action.type === ActionType.UPDATE_EDIT_PROFILE) 
    {
        return state.merge(fromJS(action.userObject));
    }
    return state
}

function submission(state=Map(), action: Action) {
    if (action.type === ActionType.SUBMIT_EDIT_PROFILE) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                isUpdatingUser: true,
                hasUpdatedUser: false
            }).delete('updateUserError')
        } else if (action.status === Status.SUCCESS) {
            return state.merge({
                isUpdatingUser: false,
                hasUpdatedUser: true
            })
        } else if (action.status === Status.FAILURE) {
            // TODO: more robust error handling
            let error = 'Unknown error. Please try again.'
            if (action.error.message === 'Validation (isURL) failed for website_url') {
                error = 'Please enter a valid website URL.'
            }
            return state.merge({
                isUpdatingUser: false,
                hasUpdatedUser: false,
                updateUserError: error
            })
        }
    }
    return state
}

function hasChanged(state=false, action: Action) {
    if (action.type === ActionType.UPDATE_EDIT_PROFILE
        || (action.type === ActionType.UPLOAD_FILE
            && action.uploadType === UploadType.ProfilePicture
            && action.status === Status.SUCCESS)
        || (action.type === ActionType.UPLOAD_FILE
            && action.uploadType === UploadType.CoverImage
            && action.status === Status.SUCCESS))
    {
        return true
    }
    return state
}

const reducers = {
    meta,
    fields,
    submission,
    hasChanged
}

// if the user entity is updated AFTER the user accesses 
// edit profile page, we need to update the fields as
// this will be the first time the web client has access to them
function entityUpdate(state: State, action: Action) {
    let users = action.response.entities.users
    if (users && state.getIn(['meta', 'id']) > 0 && state.getIn(['meta', 'id']) in users) {
        let id = state.getIn(['meta', 'id'])
        return state.update('fields', fields => fields.merge({
            bio: users[id].description || '',
            fullName: users[id].full_name || '',
            website: users[id].website_url || '',
        }))
    }
    return state
}

export default function(state = Map<string, any>(), action: Action) {
    if (action.type === ActionType.CLEAR_EDIT_PROFILE) {
        return Map()
    } else if (action.type === ActionType.ENTITY_UPDATE) {
        return entityUpdate(state, action)
    } else {
        return combineReducers(reducers)(state, action)
    }
}