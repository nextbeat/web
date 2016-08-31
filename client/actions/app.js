import { assign } from 'lodash'

import ActionTypes from './types'
import { Status } from './types'
import Schemas from '../schemas'
import { API_CALL, API_CANCEL } from './types'

/**********
 * FETCHING
 **********/

function fetchTags(pagination) {
    return {
        type: ActionTypes.TAGS,
        [API_CALL]: {
            schema: Schemas.TAGS,
            endpoint: "tags",
            pagination
        }
    }
}

export function loadTags() {
    return fetchTags({
        limit: "all",
        page: 1
    });
}

/********
 * RESIZE
 ********/

export function resizeWindow(width) {
    return {
        type: ActionTypes.RESIZE,
        width
    }
}

/*******
 * CLEAR
 *******/

export function triggerAuthError() {
    return {
        type: ActionTypes.TRIGGER_AUTH_ERROR,
        status: Status.FAILURE,
        error: "User is not logged in."
    }
}

export function clearApp() {
    return {
        type: ActionTypes.CLEAR_APP
    }
}

/**************
 * USER ACTIONS
 **************/

export function promptModal(modalType) {
    return {
        type: ActionTypes.PROMPT_MODAL,
        modalType
    }
}

export function closeModal() {
    return {
        type: ActionTypes.CLOSE_MODAL
    }
}

export function selectSidebar() {
    return {
        type: ActionTypes.SELECT_SIDEBAR
    }
}

export function closeSidebar() {
    return {
        type: ActionTypes.CLOSE_SIDEBAR
    }
}

/********
 * EVENTS
 ********/

export function onBeforeUnload() {
    return {
        type: ActionTypes.ON_BEFORE_UNLOAD
    }
}