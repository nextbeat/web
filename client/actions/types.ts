import { AnyAction } from 'redux'
import { ThunkAction as ReduxThunkAction } from 'redux-thunk'

import { Store, Dispatch } from '@types'
import { Schema } from 'normalizr'

export enum Status {
    REQUESTING = 'REQUESTING',
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE'
} 

export type AnalyticsType = 'event' | 'page' | 'identify'

export enum AnalyticsEventType {
    SESSION_START = 'SESSION_START',
    SESSION_STOP = 'SESSION_STOP',
    VIDEO_IMPRESSION = 'VIDEO_IMPRESSION'
}

export enum AnalyticsSessionType {
    APP = 'APP',
    STACK = 'STACK',
    CHAT = 'CHAT'
}

export interface Pagination {
    page: number
    limit: number | "all"
    beforeDate?: number // unix epoch in milliseconds
}

export interface ApiCall {
    endpoint: string
    auth?: object
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

export interface AnalyticsCall {
    type: AnalyticsType
    category?: string
    action?: string
    label?: string | number
    callback?: () => void
    userId?: number
    [key: string]: any // metrics and dimensions
}

export interface GenericAction extends AnyAction {
    type: ActionType
    status?: Status
}

export interface ApiCallAction extends GenericAction {
    API_CALL: ApiCall
    response?: { 
        result: any
        entities: { [key: string]: any }
        limit?: number
        page?: number
    }
    rawResponse?: any
}

export interface ApiCancelAction extends GenericAction {
    API_CANCEL: ApiCancel
}

export interface AnalyticsAction extends GenericAction {
    GA: AnalyticsCall
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
    RECEIVE_MEDIA_ITEM_UPDATE = 'RECEIVE_MEDIA_ITEM_UPDATE',
    RECEIVE_MEDIA_ITEM_DELETE = 'RECEIVE_MEDIA_ITEM_DELETE',
    RECEIVE_NOTIFICATION_COMMENT = 'RECEIVE_NOTIFICATION_COMMENT',
    RECEIVE_ROOM_CLOSED = 'RECEIVE_ROOM_CLOSED',
    RECEIVE_COMMUNITY_UPDATE = 'RECEIVE_COMMUNITY_UPDATE',
    RECEIVE_BOOKMARK_UPDATE = 'RECEIVE_BOOKMARK_UPDATE',
    RECEIVE_ROOM_MARKED = 'RECEIVE_ROOM_MARKED',

    /* GOOGLE ANALYTICS */
    GA = 'GA',
 
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
    ROOM_BAN = 'BAN',
    ROOM_UNBAN = 'UNBAN',
    USE_CHAT = 'USE_CHAT',
    BOOKMARK = 'BOOKMARK',
    UNBOOKMARK = 'UNBOOKMARK',
    DID_PLAY_VIDEO = 'DID_PLAY_VIDEO',
    PLAYBACK_DID_START = 'PLAYBACK_DID_START',
    PLAYBACK_DID_END = 'PLAYBACK_DID_END',
    LOG_VIDEO_IMPRESSION = 'LOG_VIDEO_IMPRESSION',
    SET_CONTINUOUS_PLAY = 'SET_CONTINUOUS_PLAY',
    UPDATE_CONTINUOUS_PLAY_COUNTDOWN = 'UPDATE_CONTINUOUS_PLAY_COUNTDOWN',
    CANCEL_CONTINUOUS_PLAY_COUNTDOWN = 'CANCEL_CONTINUOUS_PLAY_COUNTDOWN',
    SELECT_MEDIA_ITEM = 'SELECT_MEDIA_ITEM',
    RECORD_VIEW = 'RECORD_VIEW',
    GO_TO_COMMENT = 'GO_TO_COMMENT',
    DESELECT_COMMENT = 'DESELECT_COMMENT',
    MARK_STACK = 'MARK_STACK',
    ROOM_ADS = 'ROOM_ADS',
    CLEAR_COMMENTS = 'CLEAR_COMMENTS',
    CLEAR_ROOM = 'CLEAR_ROOM',

    /* USER */
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    SIGNUP = 'SIGNUP',
    CLEAR_LOGIN_SIGNUP = 'CLEAR_LOGIN_SIGNUP',
    SYNC_STACKS = 'SYNC_STACKS',
    UPDATE_USER = 'UPDATE_USER',
    BOOKMARKED_STACKS = 'BOOKMARKED_STACKS',
    CLEAR_CLOSED_BOOKMARKED_STACKS = 'CLEAR_CLOSED_BOOKMARKED_STACKS',
    SUBSCRIPTIONS = 'SUBSCRIPTIONS',
    SUBSCRIBE = 'SUBSCRIBE',
    UNSUBSCRIBE = 'UNSUBSCRIBE',
    CREATOR_BAN = 'CREATOR_BAN',
    CREATOR_UNBAN = 'CREATOR_UNBAN',
    MOD = 'MOD',
    UNMOD = 'UNMOD',

    /* PUSH */
    PUSH_INITIALIZE = 'PUSH_INITIALIZE',
    PUSH_SUBSCRIBE = 'PUSH_SUBSCRIBE',
    PUSH_UNSUBSCRIBE = 'PUSH_UNSUBSCRIBE',
    PUSH_SYNC_SUBSCRIPTION = 'PUSH_SYNC_SUBSCRIPTION',

    /* UPLOAD */
    UPLOAD_FILE = 'UPLOAD_FILE',
    INITIATE_PROCESSING_STAGE = 'INITIATE_PROCESSING_STAGE',
    UPDATE_PROCESSING_PROGRESS = 'UPDATE_PROCESSING_PROGRESS',
    STOP_FILE_UPLOAD = 'STOP_FILE_UPLOAD',
    CLEAR_FILE_UPLOAD = 'CLEAR_FILE_UPLOAD',
    CLEAR_UPLOAD = 'CLEAR_UPLOAD',
    SELECT_STACK_FOR_UPLOAD = 'SELECT_STACK_FOR_UPLOAD',
    UPDATE_NEW_STACK = 'UPDATE_NEW_STACK',
    UPDATE_NEW_MEDIA_ITEM = 'UPDATE_NEW_MEDIA_ITEM',
    SUBMIT_STACK_REQUEST = 'SUBMIT_STACK_REQUEST',
    REFERENCED_COMMENT = 'REFERENCED_COMMENT',

    /*********
     * PAGES *
     *********/

    /* COMPANY */
    SUBMIT_CONTACT_MESSAGE = 'SUBMIT_CONTACT_MESSAGE',
    CLEAR_COMPANY = 'CLEAR_COMPANY',

    /* EDIT ROOM */
    EDIT_ROOM = 'EDIT_ROOM',
    UPDATE_EDIT_ROOM = 'UPDATE_EDIT_ROOM',
    SUBMIT_EDIT_ROOM = 'SUBMIT_EDIT_ROOM',
    UPDATE_THUMBNAIL = 'UPDATE_THUMBNAIL',
    USE_DEFAULT_THUMBNAIL = 'USE_DEFAULT_THUMBNAIL',
    UPDATE_TAGS = 'UPDATE_TAGS',
    CLEAR_EDIT_ROOM = 'CLEAR_EDIT_ROOM',

    /* EDIT PROFILE */
    EDIT_PROFILE = 'EDIT_PROFILE',
    UPDATE_EDIT_PROFILE = 'UPDATE_EDIT_PROFILE',
    SUBMIT_EDIT_PROFILE = 'SUBMIT_EDIT_PROFILE',
    CLEAR_EDIT_PROFILE = 'CLEAR_EDIT_PROFILE',

    /* HOME */
    HOME = 'HOME',
    CLEAR_HOME = 'CLEAR_HOME',

    /* PARTNER */
    PARTNER = 'PARTNER',
    CAMPAIGN = 'CAMPAIGN',
    CAMPAIGN_ROOM = 'CAMPAIGN_ROOM',
    CLEAR_PARTNER = 'CLEAR_PARTNER',

    /* PROFILE */
    USER_STACKS = 'USER_STACKS',
    USER = 'USER',
    CLEAR_PROFILE = 'CLEAR_PROFILE',

    /* ROOM PAGE */
    ROOM_PAGE = 'ROOM_PAGE',
    SEARCH_CHAT = 'SEARCH_CHAT',
    CLEAR_SEARCH_CHAT = 'CLEAR_SEARCH_CHAT',
    HIDE_SEARCH_CHAT_RESULTS = 'HIDE_SEARCH_CHAT_RESULTS',
    SEARCH_SUGGESTIONS = 'SEARCH_SUGGESTIONS',
    MENTION_USER = 'MENTION_USER',
    CLEAR_CHAT_MESSAGE = 'CLEAR_CHAT_MESSAGE',
    PROMPT_CHAT_ACTIONS = 'PROMPT_CHAT_ACTIONS',
    CLOSE_STACK = 'CLOSE_STACK',
    DELETE_STACK = 'DELETE_STACK',
    DELETE_MEDIA_ITEM = 'DELETE_MEDIA_ITEM',
    EDIT_MEDIA_ITEM_TITLE = 'EDIT_MEDIA_ITEM_TITLE',
    SELECT_DETAIL_SECTION = 'SELECT_DETAIL_SECTION',
    EXPAND_CHAT = 'EXPAND_CHAT',
    COLLAPSE_CHAT = 'COLLAPSE_CHAT',
    ROOM_SHOP = 'ROOM_SHOP',
    EXPAND_SHOP_SPONSOR = 'EXPAND_SHOP_SPONSOR',
    LOG_SHOP_IMPRESSION = 'LOG_SHOP_IMPRESSION',
    CLEAR_ROOM_PAGE = 'CLEAR_ROOM_PAGE',

    /* SEARCH */
    SEARCH = 'SEARCH',
    CLEAR_SEARCH = 'CLEAR_SEARCH',

    /* SECTION */
    SECTION = 'SECTION',
    CLEAR_SECTION = 'CLEAR_SECTION',

    /* SUPPORT */
    VALIDATE_PASSWORD_RESET_TOKEN = 'VALIDATE_PASSWORD_RESET_TOKEN',
    RESET_PASSWORD = 'RESET_PASSWORD',
    SEND_PASSWORD_RESET_REQUEST = 'SEND_PASSWORD_RESET_REQUEST',
    SEND_EMAIL_UNSUBSCRIBE_REQUEST = 'SEND_EMAIL_UNSUBSCRIBE_REQUEST',

    /* TAG */
    TAG = 'TAG',
    TAG_STACKS = 'TAG_STACKS',
    CLEAR_TAG = 'CLEAR_TAG',
    CLEAR_TAG_STACKS = 'CLEAR_TAG_STACKS',

    /*********
     * OTHER *
     *********/

    ENTITY_UPDATE = 'ENTITY_UPDATE',
    CLEAR_FETCH = 'CLEAR_FETCH'
}

import { AppActionAll } from './app'
import { EddyActionAll } from './eddy'
import { GAActionAll } from './ga'
import { NotificationActionAll } from './notifications'
import { PushActionAll } from './push'
import { RoomActionAll } from './room'
import { UploadActionAll } from './upload'
import { UserActionAll } from './user'

import { CompanyActionAll } from './pages/company'
import { EditProfileActionAll } from './pages/editProfile'
import { EditRoomActionAll } from './pages/editRoom'
import { HomeActionAll } from './pages/home'
import { PartnerActionAll } from './pages/partner'
import { ProfileActionAll } from './pages/profile'
import { RoomPageActionAll } from './pages/room'
import { SearchActionAll } from './pages/search'
import { SectionActionAll } from './pages/section'
import { SupportActionAll } from './pages/support'
import { TagActionAll } from './pages/tag'

interface OtherAction extends GenericAction {
    type: ActionType.ENTITY_UPDATE | ActionType.CLEAR_FETCH
}


export type Action = 
    AppActionAll |
    EddyActionAll |
    GAActionAll |
    NotificationActionAll |
    PushActionAll |
    RoomActionAll |
    UploadActionAll |
    UserActionAll |
    CompanyActionAll |
    EditProfileActionAll |
    EditRoomActionAll |
    HomeActionAll |
    PartnerActionAll |
    ProfileActionAll |
    RoomPageActionAll |
    SearchActionAll |
    SectionActionAll |
    SupportActionAll |
    TagActionAll |
    OtherAction

