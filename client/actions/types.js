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

export const ANALYTICS = 'ANALYTICS';
export const AnalyticsTypes = {
    IDENTIFY: 'IDENTIFY',
    TRACK: 'TRACK',
    PAGE: 'PAGE'
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
    CLEAR_APP: 'CLEAR_APP',

    /******
     * HOME
     ******/

    HOME: 'HOME',
    CLEAR_HOME: 'CLEAR_HOME',

    /**************
     * HOME SECTION
     **************/

    SECTION: 'SECTION',
    CLEAR_SECTION: 'CLEAR_SECTION',

    /*****
     * TAG
     *****/

    TAG: 'TAG',
    TAG_STACKS: 'TAG_STACKS',
    CLEAR_TAG: 'CLEAR_TAG',
    CLEAR_TAG_STACKS: 'CLEAR_TAG_STACKS',

    /*******
     * STACK
     *******/

    STACK: 'STACK',
    MEDIA_ITEMS: 'MEDIA_ITEMS',
    COMMENTS: 'COMMENTS',
    MORE_STACKS: 'MORE_STACKS',
    SEND_COMMENT: 'SEND_COMMENT',
    BOOKMARK: 'BOOKMARK',
    UNBOOKMARK: 'UNBOOKMARK',
    CLOSE_STACK: 'CLOSE_STACK',
    DELETE_STACK: 'DELETE_STACK',
    SELECT_MEDIA_ITEM: 'SELECT_MEDIA_ITEM',
    SELECT_DETAIL_SECTION: 'SELECT_DETAIL_SECTION',
    CLOSE_DETAIL_SECTION: 'CLOSE_DETAIL_SECTION',
    RECORD_VIEW: 'RECORD_VIEW',
    CLEAR_STACK: 'CLEAR_STACK',

    /*********
     * PROFILE
     *********/

    USER_OPEN_STACKS: 'USER_OPEN_STACKS',
    USER_CLOSED_STACKS: 'USER_CLOSED_STACKS',
    USER: 'USER',
    CLEAR_PROFILE: 'CLEAR_PROFILE',

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
    SYNC_NOTIFICATIONS: 'SYNC_NOTIFICATIONS',
    MARK_AS_READ: 'MARK_AS_READ',

    /********
     * SEARCH
     ********/

    SEARCH: 'SEARCH',
    CLEAR_SEARCH: 'CLEAR_SEARCH',

    /********
     * UPLOAD
     ********/

    UPLOAD_FILE: 'UPLOAD_FILE',
    UPLOAD_POSTER_FILE: 'UPLOAD_POSTER_FILE',
    UPLOAD_THUMBNAIL: 'UPLOAD_THUMBNAIL',
    CLEAR_THUMBNAIL: 'CLEAR_THUMBNAIL',
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
    JOIN_ROOM: 'JOIN_ROOM',
    LEAVE_ROOM: 'LEAVE_ROOM',
    RECEIVE_COMMENT: 'RECEIVE_COMMENT',
    RECEIVE_NOTIFICATION: 'RECEIVE_NOTIFICATION',
    RECEIVE_NOTIFICATION_COMMENT: 'RECEIVE_NOTIFICATION_COMMENT',
    RECEIVE_MEDIA_ITEM: 'RECEIVE_MEDIA_ITEM',
    RECEIVE_STACK_CLOSED: 'RECEIVE_STACK_CLOSED',

    /*********
     * SUPPORT
     *********/

    VALIDATE_PASSWORD_RESET_TOKEN: 'VALIDATE_PASSWORD_RESET_TOKEN',
    RESET_PASSWORD: 'RESET_PASSWORD',
    SEND_PASSWORD_RESET_REQUEST: 'SEND_PASSWORD_RESET_REQUEST',
    SEND_EMAIL_UNSUBSCRIBE_REQUEST: 'SEND_EMAIL_UNSUBSCRIBE_REQUEST',

    /*******
     * OTHER
     *******/

    ENTITY_UPDATE: 'ENTITY_UPDATE',
    CLEAR_FETCH: 'CLEAR_FETCH',
    ANALYTICS: 'ANALYTICS'

}

