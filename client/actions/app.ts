import assign from 'lodash-es/assign'
import { Location } from 'history'

import { 
    ActionType,
    GenericAction,
    ApiCallAction,
    ApiCancelAction,
    ThunkAction,
    Pagination,
    Status
} from '@actions/types'
import * as Schema from '@schemas'

import { NotLoggedInError } from '@errors'

export type AppActionAll =
    TagsAction |
    ResizeAction |
    TriggerAuthErrorAction |
    ClearAppAction |
    CleanCacheAction |
    PromptModalAction |
    CloseModalAction |
    PromptDropdownAction |
    CloseDropdownAction |
    SelectSidebarAction |
    CloseSidebarAction |
    SetVideoVolumeAction |
    CollapseSplashTopbarAction |
    ExpandSplashTopbarAction |
    HasNavigatedAction |
    OnBeforeUploadAction 

/**********
 * FETCHING
 **********/

interface TagsAction extends ApiCallAction {
    type: ActionType.TAGS
}
function fetchTags(pagination: Pagination): TagsAction {
    return {
        type: ActionType.TAGS,
        API_CALL: {
            schema: Schema.Tags,
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

interface ResizeAction extends GenericAction {
    type: ActionType.RESIZE
    width: number
}
export function resizeWindow(width: number): ResizeAction {
    return {
        type: ActionType.RESIZE,
        width
    }
}

/*******
 * CLEAR
 *******/

interface TriggerAuthErrorAction extends GenericAction {
    type: ActionType.TRIGGER_AUTH_ERROR
    status: StatusType
    error: NotLoggedInError
}
export function triggerAuthError(): TriggerAuthErrorAction {
    return {
        type: ActionType.TRIGGER_AUTH_ERROR,
        status: "failure",
        error: new NotLoggedInError()
    }
}

interface ClearAppAction extends GenericAction {
    type: ActionType.CLEAR_APP
}
export function clearApp(): ClearAppAction {
    return {
        type: ActionType.CLEAR_APP
    }
}

interface CleanCacheAction extends GenericAction {
    type: ActionType.CLEAN_CACHE
}
export function cleanCache(): CleanCacheAction {
    return {
        type: ActionType.CLEAN_CACHE
    }
}

/**************
 * USER ACTIONS
 **************/

interface PromptModalAction extends GenericAction {
    type: ActionType.PROMPT_MODAL
    modalType: string
}
export function promptModal(modalType: string): PromptModalAction {
    return {
        type: ActionType.PROMPT_MODAL,
        modalType
    }
}

interface CloseModalAction extends GenericAction {
    type: ActionType.CLOSE_MODAL
}
export function closeModal(): CloseModalAction {
    return {
        type: ActionType.CLOSE_MODAL
    }
}

interface PromptDropdownAction extends GenericAction {
    type: ActionType.PROMPT_DROPDOWN
    dropdownType: string
}
export function promptDropdown(dropdownType: string): PromptDropdownAction {
    return {
        type: ActionType.PROMPT_DROPDOWN,
        dropdownType
    }
}

interface CloseDropdownAction extends GenericAction {
    type: ActionType.CLOSE_DROPDOWN
    dropdownType: string
}
export function closeDropdown(dropdownType: string): CloseDropdownAction {
    return {
        type: ActionType.CLOSE_DROPDOWN,
        dropdownType
    }
}

export function toggleDropdown(dropdownType: string): ThunkAction {
    return (dispatch, getState) => {
        let app = new App(getState())
        if (app.isActiveDropdown(dropdownType)) {
            dispatch(closeDropdown(dropdownType))
        } else {
            dispatch(promptDropdown(dropdownType))
        }
    }
}

interface SelectSidebarAction extends GenericAction {
    type: ActionType.SELECT_SIDEBAR
}
export function selectSidebar(): SelectSidebarAction {
    return {
        type: ActionType.SELECT_SIDEBAR
    }
}

interface CloseSidebarAction extends GenericAction {
    type: ActionType.CLOSE_SIDEBAR
}
export function closeSidebar(): CloseSidebarAction {
    return {
        type: ActionType.CLOSE_SIDEBAR
    }
}

interface SetVideoVolumeAction extends GenericAction {
    type: ActionType.SET_VIDEO_VOLUME
    volume: number
}
export function setVideoVolume(volume: number): SetVideoVolumeAction {
    return {
        type: ActionType.SET_VIDEO_VOLUME,
        volume
    }
}

interface CollapseSplashTopbarAction extends GenericAction {
    type: ActionType.COLLAPSE_SPLASH_TOPBAR
}
export function collapseSplashTopbar(): CollapseSplashTopbarAction {
    return {
        type: ActionType.COLLAPSE_SPLASH_TOPBAR
    }
}

interface ExpandSplashTopbarAction extends GenericAction {
    type: ActionType.EXPAND_SPLASH_TOPBAR
}
export function expandSplashTopbar(): ExpandSplashTopbarAction {
    return {
        type: ActionType.EXPAND_SPLASH_TOPBAR
    }
}

interface HasNavigatedAction extends GenericAction {
    type: ActionType.HAS_NAVIGATED
    location: Location
}
export function hasNavigated(location: Location): HasNavigatedAction {
    return {
        type: ActionType.HAS_NAVIGATED,
        location
    }
}

/********
 * EVENTS
 ********/

interface OnBeforeUploadAction extends GenericAction {
    type: ActionType.ON_BEFORE_UNLOAD
}
export function onBeforeUnload(): OnBeforeUploadAction {
    return {
        type: ActionType.ON_BEFORE_UNLOAD
    }
}