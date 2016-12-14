/********
 * STATUS
 ********/

export const Status = {
    REQUESTING: 'REQUESTING',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
}

export const API_CALL = 'API_CALL';
export const API_CANCEL = 'API_CANCEL';

export const GA = 'GA';
export const GATypes = {
    IDENTIFY: 'IDENTIFY',
    PAGE: 'PAGE',
    EVENT: 'EVENT'
}

export const AnalyticsTypes = {
    SESSION_START: 'SESSION_START',
    SESSION_STOP: 'SESSION_STOP',
    VIDEO_IMPRESSION: 'VIDEO_IMPRESSION'
}

export const AnalyticsSessionTypes = {
    APP: 'APP',
    CHAT: 'CHAT',
    STACK: 'STACK'
}

export const PushTypes = {
    UNSUPPORTED: 'UNSUPPORTED',
    DENIED: 'DENIED',
    SUBSCRIBED: 'SUBSCRIBED',
    UNSUBSCRIBED: 'UNSUBSCRIBED',
    ERROR: 'ERROR'
}

export default {

    /*****
     * APP
     *****/

    TAGS: 'TAGS',
    RESIZE: 'RESIZE',
    PROMPT_MODAL: 'PROMPT_MODAL',
    CLOSE_MODAL: 'CLOSE_MODAL',
    PROMPT_DROPDOWN: 'PROMPT_DROPDOWN',
    CLOSE_DROPDOWN: 'CLOSE_DROPDOWN',
    SELECT_SIDEBAR: 'SELECT_SIDEBAR',
    CLOSE_SIDEBAR: 'CLOSE_SIDEBAR',
    SET_VIDEO_VOLUME: 'SET_VIDEO_VOLUME',
    ON_BEFORE_UNLOAD: 'ON_BEFORE_UNLOAD',
    TRIGGER_AUTH_ERROR: 'TRIGGER_AUTH_ERROR',
    CLEAN_CACHE: 'CLEAN_CACHE',
    CLEAR_APP: 'CLEAR_APP',

    /******
     * ROOM
     ******/

    ROOM: 'ROOM',
    MEDIA_ITEMS: 'MEDIA_ITEMS',
    COMMENTS: 'COMMENTS',
    COMMENTS_METADATA: 'COMMENTS_METADATA',
    SEND_COMMENT: 'SEND_COMMENT',
    USE_CHAT: 'USE_CHAT',
    BOOKMARK: 'BOOKMARK',
    UNBOOKMARK: 'UNBOOKMARK',
    SELECT_MEDIA_ITEM: 'SELECT_MEDIA_ITEM',
    RECORD_VIEW: 'RECORD_VIEW',
    CLEAR_COMMENTS: 'CLEAR_COMMENTS',
    CLEAR_ROOM: 'CLEAR_ROOM',

    /******
     * HOME
     ******/

    HOME: 'HOME',
    CLEAR_HOME: 'CLEAR_HOME',

    /*********
     * SECTION
     *********/

    SECTION: 'SECTION',
    CLEAR_SECTION: 'CLEAR_SECTION',

    /*****
     * TAG
     *****/

    TAG: 'TAG',
    TAG_STACKS: 'TAG_STACKS',
    CLEAR_TAG: 'CLEAR_TAG',
    CLEAR_TAG_STACKS: 'CLEAR_TAG_STACKS',

    /***********
     * ROOM PAGE
     ***********/

    ROOM_PAGE: 'ROOM_PAGE',
    MORE_STACKS: 'MORE_STACKS',
    BAN_USER: 'BAN_USER',
    UNBAN_USER: 'UNBAN_USER',
    UPDATE_CHAT_MESSAGE: 'UPDATE_CHAT_MESSAGE',
    PROMPT_CHAT_ACTIONS: 'PROMPT_CHAT_ACTIONS',
    CLOSE_STACK: 'CLOSE_STACK',
    DELETE_STACK: 'DELETE_STACK',
    SELECT_DETAIL_SECTION: 'SELECT_DETAIL_SECTION',
    CLOSE_DETAIL_SECTION: 'CLOSE_DETAIL_SECTION',
    CLEAR_ROOM_PAGE: 'CLEAR_ROOM_PAGE',

    /*********
     * PROFILE
     *********/

    USER_OPEN_STACKS: 'USER_OPEN_STACKS',
    USER_CLOSED_STACKS: 'USER_CLOSED_STACKS',
    USER: 'USER',
    CLEAR_PROFILE: 'CLEAR_PROFILE',

    /********
     * SEARCH
     ********/

    SEARCH: 'SEARCH',
    CLEAR_SEARCH: 'CLEAR_SEARCH',

    /*********
     * SUPPORT
     *********/

    VALIDATE_PASSWORD_RESET_TOKEN: 'VALIDATE_PASSWORD_RESET_TOKEN',
    RESET_PASSWORD: 'RESET_PASSWORD',
    SEND_PASSWORD_RESET_REQUEST: 'SEND_PASSWORD_RESET_REQUEST',
    SEND_EMAIL_UNSUBSCRIBE_REQUEST: 'SEND_EMAIL_UNSUBSCRIBE_REQUEST',

    /********
     * UPLOAD
     ********/

    UPLOAD_FILE: 'UPLOAD_FILE',
    UPLOAD_POSTER_FILE: 'UPLOAD_POSTER_FILE',
    UPLOAD_THUMBNAIL: 'UPLOAD_THUMBNAIL',
    CLEAR_THUMBNAIL: 'CLEAR_THUMBNAIL',
    UPLOAD_PROFILE_PICTURE: 'UPLOAD_PROFILE_PICTURE',
    CLEAR_UPLOAD: 'CLEAR_UPLOAD',
    SELECT_STACK_FOR_UPLOAD: 'SELECT_STACK_FOR_UPLOAD',
    UPDATE_NEW_STACK: 'UPDATE_NEW_STACK',
    UPDATE_NEW_MEDIA_ITEM: 'UPDATE_NEW_MEDIA_ITEM',
    SUBMIT_STACK_REQUEST: 'SUBMIT_STACK_REQUEST',

    /******
     * XMPP
     ******/

    CONNECT_XMPP: 'CONNECT_XMPP',
    DISCONNECT_XMPP: 'DISCONNECT_XMPP',
    RECONNECT_XMPP: 'RECONNECT_XMPP',
    LOST_XMPP_CONNECTION: 'LOST_XMPP_CONNECTION',
    JOIN_XMPP_ROOM: 'JOIN_XMPP_ROOM',
    LEAVE_XMPP_ROOM: 'LEAVE_XMPP_ROOM',
    RECEIVE_COMMENT: 'RECEIVE_COMMENT',
    RECEIVE_NOTIFICATION: 'RECEIVE_NOTIFICATION',
    RECEIVE_NOTIFICATION_COMMENT: 'RECEIVE_NOTIFICATION_COMMENT',
    RECEIVE_CHATBOT_COMMENT: 'RECEIVE_CHATBOT_COMMENT',
    RECEIVE_MEDIA_ITEM: 'RECEIVE_MEDIA_ITEM',
    RECEIVE_ROOM_CLOSED: 'RECEIVE_ROOM_CLOSED',

    /******
     * USER
     ******/

    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    SIGNUP: 'SIGNUP',
    CLEAR_LOGIN_SIGNUP: 'CLEAR_LOGIN_SIGNUP',
    SYNC_STACKS: 'SYNC_STACKS',
    UPDATE_USER: 'UPDATE_USER',
    CLEAR_EDIT_PROFILE: 'CLEAR_EDIT_PROFILE',
    BOOKMARKED_STACKS: 'BOOKMARKED_STACKS',
    CLEAR_CLOSED_BOOKMARKED_STACKS: 'CLEAR_CLOSED_BOOKMARKED_STACKS',
    SUBSCRIPTIONS: 'SUBSCRIPTIONS',
    SUBSCRIBE: 'SUBSCRIBE',
    UNSUBSCRIBE: 'UNSUBSCRIBE',

    /***************
     * NOTIFICATIONS
     ***************/

    NOTIFICATIONS: 'NOTIFICATIONS',
    SYNC_UNREAD_NOTIFICATIONS: 'SYNC_UNREAD_NOTIFICATIONS',
    MARK_AS_READ: 'MARK_AS_READ',
    MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
    CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',

    /******
     * PUSH
     ******/

    PUSH_INITIALIZE: 'PUSH_INITIALIZE',
    PUSH_SUBSCRIBE: 'PUSH_SUBSCRIBE',
    PUSH_UNSUBSCRIBE: 'PUSH_UNSUBSCRIBE',
    PUSH_SYNC_SUBSCRIPTION: 'PUSH_SYNC_SUBSCRIPTION',

    /***********
     * ANALYTICS
     ***********/

    START_NEW_SESSION: 'START_NEW_SESSION',
    SEND_PENDING_EVENTS: 'SEND_PENDING_EVENTS',
    LOG_VIDEO_IMPRESSION: 'LOG_VIDEO_IMPRESSION',
    PROLONG_CHAT_SESSION:'PROLONG_CHAT_SESSION',

    /*******
     * OTHER
     *******/

    ENTITY_UPDATE: 'ENTITY_UPDATE',
    CLEAR_FETCH: 'CLEAR_FETCH',
    ANALYTICS: 'ANALYTICS',
    GA: 'GA'
}

