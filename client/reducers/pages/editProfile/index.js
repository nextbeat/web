import { Map, fromJS } from 'immutable'
import { ActionTypes, Status, UploadTypes } from '../../../actions'
import { combineReducers } from '../../utils'

function meta(state=Map(), action) {
    if (action.type === ActionTypes.EDIT_PROFILE) {
        return state.get('id', action.userId)
    }
    return state
}

function fields(state=Map(), action) {
    if (action.type === ActionTypes.EDIT_PROFILE 
        || action.type === ActionTypes.UPDATE_EDIT_PROFILE) 
    {
        return state.merge(fromJS(action.userObject));
    }
    return state
}

function submission(state=Map(), action) {
    if (action.type === ActionTypes.SUBMIT_EDIT_PROFILE) {
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
            if (action.error === 'Validation (isURL) failed for website_url') {
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

function hasChanged(state=false, action) {
    if (action.type === ActionTypes.UPDATE_EDIT_PROFILE
        || (action.type === ActionTypes.UPLOAD_FILE
            && action.uploadType === UploadTypes.PROFILE_PICTURE
            && action.status === Status.SUCCESS)
        || (action.type === ActionTypes.UPLOAD_FILE
            && action.uploadType === UploadTypes.COVER_IMAGE
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
function entityUpdate(state, action) {
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

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_EDIT_PROFILE) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}