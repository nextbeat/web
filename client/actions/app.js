import assign from 'lodash/assign'

import ActionTypes from './types'
import { Status } from './types'
import Schemas from '../schemas'
import { API_CALL, API_CANCEL } from './types'
import { App } from '../models'

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

export function cleanCache() {
    return {
        type: ActionTypes.CLEAN_CACHE
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

export function promptDropdown(dropdownType) {
    return {
        type: ActionTypes.PROMPT_DROPDOWN,
        dropdownType
    }
}

export function closeDropdown(dropdownType) {
    return {
        type: ActionTypes.CLOSE_DROPDOWN,
        dropdownType
    }
}

export function toggleDropdown(dropdownType) {
    return (dispatch, getState) => {
        let app = new App(getState())
        if (app.isActiveDropdown(dropdownType)) {
            dispatch(closeDropdown(dropdownType))
        } else {
            dispatch(promptDropdown(dropdownType))
        }
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

export function setVideoVolume(volume) {
    return {
        type: ActionTypes.SET_VIDEO_VOLUME,
        volume
    }
}

export function collapseSplashTopbar() {
    return {
        type: ActionTypes.COLLAPSE_SPLASH_TOPBAR
    }
}

export function expandSplashTopbar() {
    return {
        type: ActionTypes.EXPAND_SPLASH_TOPBAR
    }
}

export function hasNavigated(location) {
    return {
        type: ActionTypes.HAS_NAVIGATED,
        location
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