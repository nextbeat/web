import ActionTypes from './types'
import Schemas from '../schemas'
import { loadPaginatedObjects } from './utils'
import { API_CALL } from '../middleware/api'

/**********
 * FETCHING
 **********/

function onProfileSuccess(store, next, action, response) {
    const profile = response.entities.users[response.result];
    store.dispatch(loadOpenStacksForUser(profile.username))
    store.dispatch(loadClosedStacksForUser(profile.username))
}

function fetchProfile(username) {
    return {
        type: ActionTypes.USER,
        [API_CALL]: {
            schema: Schemas.USER,
            endpoint: `users/${username}`,
            onSuccess: onProfileSuccess
        }
    }
}

export function loadProfile(username) {
    return fetchProfile(username);
}

function fetchStacksForUser(username, type, status, pagination) {
    return {
        type,
        [API_CALL]: {
            schema: Schemas.STACKS,
            endpoint: "stacks",
            queries: { author: username, status: status },
            pagination
        }
    }
}

export function loadOpenStacksForUser(username) {
    return loadPaginatedObjects('profile', 'stacks', fetchStacksForUser.bind(this, username, ActionTypes.USER_OPEN_STACKS, "open"), "all");
}

export function loadClosedStacksForUser(username) {
    // TODO: paginate closed stacks
    return loadPaginatedObjects('profile', 'stacks', fetchStacksForUser.bind(this, username, ActionTypes.USER_CLOSED_STACKS, "closed", "all"));
}

/*******
 * RESET
 *******/

export function clearProfile() {
    return {
        type: ActionTypes.CLEAR_PROFILE
    }
}
