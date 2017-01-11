import { Map } from 'immutable'
import { ActionTypes, Status } from '../../actions'

function login(state, action) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isLoggingIn: true
            }).delete('loginError')
        case Status.SUCCESS:
            return state.merge({
                isLoggingIn: false,
                id: action.user.id,
                token: action.user.token,
            })
        case Status.FAILURE:
            return state.merge({
                isLoggingIn: false,
                loginError: action.error
            })
    }
    return state
}

function logout(state, action) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isLoggingOut: true
            })
        case Status.SUCCESS:
            return state.set('isLoggingOut', false)
                .delete('id')
                .delete('token')
                .delete('username')
                .delete('hasUpdatedEntity')
        case Status.FAILURE:
            return state.merge({
                isLoggingOut: false
            })
    }
    return state
}

function signup(state, action) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isSigningUp: true
            }).delete('signupError')
        case Status.SUCCESS:
            return state.merge({
                isSigningUp: false
            })
        case Status.FAILURE:
            return state.merge({
                isSigningUp: false,
                signupError: action.error
            })
    }
    return state
}

function clearLoginSignup(state, action) {
    return state.merge({
        isSigningUp: false,
        isLoggingIn: false,
        hasUpdatedEntity: false,
    }).delete('loginError').delete('signupError');
}

function entityUpdate(state, action) {
    let users = action.response.entities.users
    if (users && state.get('id') > 0 && state.get('id') in users) {
        return state.merge({
            hasUpdatedEntity: true
        })
    }
    return state
}

function updateUser(state, action) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isUpdatingUser: true
            }).delete('updateUserError').delete('hasUpdatedUser')
        case Status.SUCCESS:
            return state.merge({
                isUpdatingUser: false,
                hasUpdatedUser: true
            })
        case Status.FAILURE: 
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
    return state
}

function uploadProfilePicture(state, action) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isUpdatingProfilePicture: true,
                updatedProfilePictureUrl: action.url,
            }).delete('updateProfilePictureError', 'hasUpdatedProfilePicture')
        case Status.SUCCESS:
            return state.merge({
                isUpdatingProfilePicture: false,
                hasUpdatedProfilePicture: true
            })
        case Status.FAILURE:
            return state.merge({
                isUpdatingProfilePicture: false,
                hasUpdatedProfilePicture: true,
                updateProfilePictureError: action.error
            })
    }
    return state
}

function bookmarkedStacks(state, action) {
    if (action.status === Status.SUCCESS && action.stackStatus === 'open') {
        return state.set('loadedBookmarkedStacks', true)
    }
    return state
}

function subscriptions(state, action) {
    if (action.status === Status.SUCCESS) {
        return state.set('loadedSubscriptions', true)
    }
    return state
}

function clearEditProfile(state, action) {
    // todo: clean up
    return state
        .delete('isUpdatingUser')
        .delete('hasUpdatedUser')
        .delete('updateUserError')
        .delete('isUpdatingProfilePicture')
        .delete('hasUpdatedProfilePicture')
        .delete('updateProfilePictureError')
        .delete('updatedProfilePictureUrl')
}

export default function meta(state=Map(), action) {
    if (action.type === ActionTypes.LOGIN) {
        return login(state, action)
    } else if (action.type === ActionTypes.LOGOUT) {
        return logout(state, action)
    } else if (action.type === ActionTypes.SIGNUP) {
        return signup(state, action)
    } else if (action.type === ActionTypes.CLEAR_LOGIN_SIGNUP) {
        return clearLoginSignup(state, action)
    } else if (action.type === ActionTypes.ENTITY_UPDATE) {
        return entityUpdate(state, action)
    } else if (action.type === ActionTypes.UPDATE_USER) {
        return updateUser(state, action)
    } else if (action.type === ActionTypes.UPLOAD_PROFILE_PICTURE) {
        return uploadProfilePicture(state, action)
    } else if (action.type === ActionTypes.CLEAR_EDIT_PROFILE) {
        return clearEditProfile(state, action)
    } else if (action.type === ActionTypes.BOOKMARKED_STACKS) {
        return bookmarkedStacks(state, action)
    } else if (action.type === ActionTypes.SUBSCRIPTIONS) {
        return subscriptions(state, action)
    }
    return state;
}
