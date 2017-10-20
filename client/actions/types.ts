import { AnyAction } from 'redux'
import { ThunkAction as ReduxThunkAction } from 'redux-thunk'

import { Store, Dispatch } from '@types'
import { Schema } from 'normalizr'

export enum Status {
    REQUESTING = 'REQUESTING',
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE'
} 

export interface Pagination {
    page: number
    limit: number | "all"
    beforeDate?: number // unix epoch in milliseconds
}

export interface ApiCall {
    endpoint: string
    authenticated?: boolean
    body?: object
    clientOnly?: boolean
    method?: "GET" | "POST" | "PUT" | "HEAD" | "DELETE"
    onSuccess?: (store: Store, next: Dispatch, action: GenericAction, response: object, rawResponse: object) => void
    onSuccessImmediate?: (store: Store, next: Dispatch, action: GenericAction, response: object, rawResponse: object) => void
    pagination?: any
    queries?: { [key: string]: string }
    schema?: Schema
}

export interface ApiCancel {
    actionTypes: string[]
}

export interface GenericAction extends AnyAction {
    type: ActionType
    status?: Status
}

export interface ApiCallAction extends GenericAction {
    API_CALL: ApiCall
}

export interface ApiCancelAction extends GenericAction {
    API_CANCEL: ApiCancel
}

export type ThunkAction = ReduxThunkAction<void, any, never>

export enum ActionType {
    
    /* APP */
    TAGS = 'TAGS',
    RESIZE = 'RESIZE',
    PROMPT_MODAL = 'PROMPT_MODAL',
    CLOSE_MODAL = 'CLOSE_MODAL',
    PROMPT_DROPDOWN = 'PROMPT_DROPDOWN',
    CLOSE_DROPDOWN = 'CLOSE_DROPDOWN',
    SELECT_SIDEBAR = 'SELECT_SIDEBAR',
    CLOSE_SIDEBAR = 'CLOSE_SIDEBAR',
    ADD_SIDEBAR_ANIMATION = 'ADD_SIDEBAR_ANIMATION',
    REMOVE_SIDEBAR_ANIMATION = 'REMOVE_SIDEBAR_ANIMATION',
    COLLAPSE_SPLASH_TOPBAR = 'COLLAPSE_SPLASH_TOPBAR',
    EXPAND_SPLASH_TOPBAR = 'EXPAND_SPLASH_TOPBAR',
    SET_VIDEO_VOLUME = 'SET_VIDEO_VOLUME',
    HAS_NAVIGATED = 'HAS_NAVIGATED',
    ON_BEFORE_UNLOAD = 'ON_BEFORE_UNLOAD',
    TRIGGER_AUTH_ERROR = 'TRIGGER_AUTH_ERROR',
    CLEAN_CACHE = 'CLEAN_CACHE',
    CLEAR_APP = 'CLEAR_APP',

    /* EDDY */
    CONNECT_EDDY = 'CONNECT_EDDY',
    RECONNECT_EDDY = 'RECONNECT_EDDY',
    DISCONNECT_EDDY = 'DISCONNECT_EDDY',
    IDENTIFY_EDDY = 'IDENTIFY_EDDY',
    UNIDENTIFY_EDDY = 'UNIDENTIFY_EDDY',
    JOIN_ROOM = 'JOIN_ROOM',
    LEAVE_ROOM = 'LEAVE_ROOM',
    START_ROOM_TIMER = 'START_ROOM_TIMER',
    RECEIVE_COMMENT = 'RECEIVE_COMMENT',
    RECEIVE_PINNED_COMMENT = 'RECEIVE_PINNED_COMMENT',
    RECEIVE_UNPINNED_COMMENT = 'RECEIVE_UNPINNED_COMMENT',
    RECEIVE_ACTIVITY_EVENT = 'RECEIVE_ACTIVITY_EVENT',
    RECEIVE_MEDIA_ITEM = 'RECEIVE_MEDIA_ITEM',
    RECEIVE_NOTIFICATION_COMMENT = 'RECEIVE_NOTIFICATION_COMMENT',
    RECEIVE_ROOM_CLOSED = 'RECEIVE_ROOM_CLOSED',
    RECEIVE_BOOKMARK_UPDATE = 'RECEIVE_BOOKMARK_UPDATE',
    RECEIVE_ROOM_MARKED = 'RECEIVE_ROOM_MARKED',

    /* NOTIFICATIONS */
    ACTIVITY = 'ACTIVITY',
    CLEAR_NOTIFICATIONS = 'CLEAR_NOTIFICATIONS',

    /* ROOM */
    ROOM = 'ROOM',
    MEDIA_ITEMS = 'MEDIA_ITEMS',
    COMMENTS = 'COMMENTS',
    ROOM_INFO = 'ROOM_INFO',
    SEND_COMMENT = 'SEND_COMMENT',
    PIN_COMMENT = 'PIN_COMMENT',
    UNPIN_COMMENT = 'UNPIN_COMMENT',
    BAN_USER = 'BAN_USER',
    UNBAN_USER = 'UNBAN_USER',
    USE_CHAT = 'USE_CHAT',
    DID_PLAY_VIDEO = 'DID_PLAY_VIDEO',
    BOOKMARK = 'BOOKMARK',
    UNBOOKMARK = 'UNBOOKMARK',
    SELECT_MEDIA_ITEM = 'SELECT_MEDIA_ITEM',
    RECORD_VIEW = 'RECORD_VIEW',
    GO_TO_COMMENT = 'GO_TO_COMMENT',
    DESELECT_COMMENT = 'DESELECT_COMMENT',
    MARK_STACK = 'MARK_STACK',
    CLEAR_COMMENTS = 'CLEAR_COMMENTS',
    CLEAR_ROOM = 'CLEAR_ROOM',

    /* SECTION */
    SECTION = 'SECTION',
    CLEAR_SECTION = 'CLEAR_SECTION'
}

import { AppActionAll } from './app'
import { EddyActionAll } from './eddy'
import { NotificationActionAll } from './notifications'
import { RoomActionAll } from './room'
import { SectionActionAll } from './pages/section'

export type Action = 
    AppActionAll |
    EddyActionAll |
    NotificationActionAll |
    RoomActionAll |
    SectionActionAll


/* DEPRECATED */

// export const Status = {
//     REQUESTING: 'REQUESTING',
//     SUCCESS: 'SUCCESS',
//     FAILURE: 'FAILURE',
// }

// export const API_CALL = 'API_CALL';
// export const API_CANCEL = 'API_CANCEL';

// export const GA = 'GA';
// export const GATypes = {
//     IDENTIFY: 'IDENTIFY',
//     PAGE: 'PAGE',
//     EVENT: 'EVENT'
// }

// export const AnalyticsTypes = {
//     SESSION_START: 'SESSION_START',
//     SESSION_STOP: 'SESSION_STOP',
//     VIDEO_IMPRESSION: 'VIDEO_IMPRESSION'
// }

// export const AnalyticsSessionTypes = {
//     APP: 'APP',
//     CHAT: 'CHAT',
//     STACK: 'STACK'
// }

// export const PushTypes = {
//     UNSUPPORTED: 'UNSUPPORTED',
//     DENIED: 'DENIED',
//     SUBSCRIBED: 'SUBSCRIBED',
//     UNSUBSCRIBED: 'UNSUBSCRIBED',
//     ERROR: 'ERROR'
// }

// export const UploadTypes = {
//     MEDIA_ITEM: 'MEDIA_ITEM',
//     THUMBNAIL: 'THUMBNAIL',
//     PROFILE_PICTURE: 'PROFILE_PICTURE',
//     COVER_IMAGE: 'COVER_IMAGE'
// }


// export default {

//     /******
//      * HOME
//      ******/

//     HOME: 'HOME',
//     CLEAR_HOME: 'CLEAR_HOME',

//     /*********
//      * SECTION
//      *********/

//     SECTION: 'SECTION',
//     CLEAR_SECTION: 'CLEAR_SECTION',

//     /*****
//      * TAG
//      *****/

//     TAG: 'TAG',
//     TAG_STACKS: 'TAG_STACKS',
//     CLEAR_TAG: 'CLEAR_TAG',
//     CLEAR_TAG_STACKS: 'CLEAR_TAG_STACKS',

//     /***********
//      * ROOM PAGE
//      ***********/

//     ROOM_PAGE: 'ROOM_PAGE',
//     MORE_STACKS: 'MORE_STACKS',
//     SEARCH_CHAT: 'SEARCH_CHAT',
//     CLEAR_SEARCH_CHAT: 'CLEAR_SEARCH_CHAT',
//     HIDE_SEARCH_CHAT_RESULTS: 'HIDE_SEARCH_CHAT_RESULTS',
//     SEARCH_SUGGESTIONS: 'SEARCH_SUGGESTIONS',
//     MENTION_USER: 'MENTION_USER',
//     CLEAR_CHAT_MESSAGE: 'CLEAR_CHAT_MESSAGE',
//     PROMPT_CHAT_ACTIONS: 'PROMPT_CHAT_ACTIONS',
//     CLOSE_STACK: 'CLOSE_STACK',
//     DELETE_STACK: 'DELETE_STACK',
//     DELETE_MEDIA_ITEM: 'DELETE_MEDIA_ITEM',
//     SELECT_DETAIL_SECTION: 'SELECT_DETAIL_SECTION',
//     CLOSE_DETAIL_SECTION: 'CLOSE_DETAIL_SECTION',
//     CLEAR_ROOM_PAGE: 'CLEAR_ROOM_PAGE',

//     /***********
//      * EDIT ROOM
//      ***********/

//     EDIT_ROOM: 'EDIT_ROOM',
//     UPDATE_EDIT_ROOM: 'UPDATE_EDIT_ROOM',
//     SUBMIT_EDIT_ROOM: 'SUBMIT_EDIT_ROOM',
//     UPDATE_THUMBNAIL: 'UPDATE_THUMBNAIL',
//     USE_DEFAULT_THUMBNAIL: 'USE_DEFAULT_THUMBNAIL',
//     UPDATE_TAGS: 'UPDATE_TAGS',
//     CLEAR_EDIT_ROOM: 'CLEAR_EDIT_ROOM',

//     /*********
//      * PROFILE
//      *********/

//     USER_STACKS: 'USER_STACKS',
//     USER: 'USER',
//     CLEAR_PROFILE: 'CLEAR_PROFILE',

//     /**************
//      * EDIT PROFILE
//      **************/

//     EDIT_PROFILE: 'EDIT_PROFILE',
//     UPDATE_EDIT_PROFILE: 'UPDATE_EDIT_PROFILE',
//     SUBMIT_EDIT_PROFILE: 'SUBMIT_EDIT_PROFILE',
//     CLEAR_EDIT_PROFILE: 'CLEAR_EDIT_PROFILE',

//     /********
//      * SEARCH
//      ********/

//     SEARCH: 'SEARCH',
//     CLEAR_SEARCH: 'CLEAR_SEARCH',

//     /*********
//      * SUPPORT
//      *********/

//     VALIDATE_PASSWORD_RESET_TOKEN: 'VALIDATE_PASSWORD_RESET_TOKEN',
//     RESET_PASSWORD: 'RESET_PASSWORD',
//     SEND_PASSWORD_RESET_REQUEST: 'SEND_PASSWORD_RESET_REQUEST',
//     SEND_EMAIL_UNSUBSCRIBE_REQUEST: 'SEND_EMAIL_UNSUBSCRIBE_REQUEST',

//     /********
//      * UPLOAD
//      ********/

//     UPLOAD_FILE: 'UPLOAD_FILE',
//     INITIATE_PROCESSING_STAGE: 'INITIATE_PROCESSING_STAGE',
//     UPDATE_PROCESSING_PROGRESS: 'UPDATE_PROCESSING_PROGRESS',
//     STOP_FILE_UPLOAD: 'STOP_FILE_UPLOAD',
//     CLEAR_FILE_UPLOAD: 'CLEAR_FILE_UPLOAD',
//     CLEAR_UPLOAD: 'CLEAR_UPLOAD',
    
//     SELECT_STACK_FOR_UPLOAD: 'SELECT_STACK_FOR_UPLOAD',
//     UPDATE_NEW_STACK: 'UPDATE_NEW_STACK',
//     UPDATE_NEW_MEDIA_ITEM: 'UPDATE_NEW_MEDIA_ITEM',
//     SUBMIT_STACK_REQUEST: 'SUBMIT_STACK_REQUEST',
//     REFERENCED_COMMENT: 'REFERENCED_COMMENT',

//     /******
//      * USER
//      ******/

//     LOGIN: 'LOGIN',
//     LOGOUT: 'LOGOUT',
//     SIGNUP: 'SIGNUP',
//     CLEAR_LOGIN_SIGNUP: 'CLEAR_LOGIN_SIGNUP',
//     SYNC_STACKS: 'SYNC_STACKS',
//     UPDATE_USER: 'UPDATE_USER',
//     CLEAR_EDIT_PROFILE: 'CLEAR_EDIT_PROFILE',
//     BOOKMARKED_STACKS: 'BOOKMARKED_STACKS',
//     CLEAR_CLOSED_BOOKMARKED_STACKS: 'CLEAR_CLOSED_BOOKMARKED_STACKS',
//     SUBSCRIPTIONS: 'SUBSCRIPTIONS',
//     SUBSCRIBE: 'SUBSCRIBE',
//     UNSUBSCRIBE: 'UNSUBSCRIBE',

//     /******
//      * PUSH
//      ******/

//     PUSH_INITIALIZE: 'PUSH_INITIALIZE',
//     PUSH_SUBSCRIBE: 'PUSH_SUBSCRIBE',
//     PUSH_UNSUBSCRIBE: 'PUSH_UNSUBSCRIBE',
//     PUSH_SYNC_SUBSCRIPTION: 'PUSH_SYNC_SUBSCRIPTION',

//     /***********
//      * ANALYTICS
//      ***********/

//     START_NEW_SESSION: 'START_NEW_SESSION',
//     SEND_PENDING_EVENTS: 'SEND_PENDING_EVENTS',
//     LOG_VIDEO_IMPRESSION: 'LOG_VIDEO_IMPRESSION',
//     PROLONG_CHAT_SESSION:'PROLONG_CHAT_SESSION',

//     /*******
//      * OTHER
//      *******/

//     ENTITY_UPDATE: 'ENTITY_UPDATE',
//     CLEAR_FETCH: 'CLEAR_FETCH',
//     ANALYTICS: 'ANALYTICS',
//     GA: 'GA'
// }

