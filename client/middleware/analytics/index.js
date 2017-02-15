import format from 'date-fns/format'

import { ActionTypes, AnalyticsTypes, AnalyticsSessionTypes, Status } from '../../actions' 
import { RoomPage, Analytics, CurrentUser, MediaItemEntity } from '../../models'
import { getStorageItem, setStorageItem, generateUuid } from '../../utils'

import { submitEvent, submitPendingEvents } from './submit'

const CHAT_SESSION_PROLONG_TIME_MSEC = 10000

/* NOTE: DEPRECATED. CURRENTLY USING GOOGLE ANALYTICS EXCLUSIVELY */

/************
 * GENERATORS
 ************/

function generateSessionId(sessionType, userId) {
    return `${userId}-${Analytics.sessionTypeString(sessionType)}-${format(new Date(), 'YYYYMMDD-HHmmssSSS')}`
}

function generateUserId(store) {
    let user = new CurrentUser(store.getState())
    let userId;

    if (user.isLoggedIn()) {
        userId = user.get('id');
    } else {    
        userId = getStorageItem('a_anon_id');
        if (!userId) {
            // generate anonymous user id
            userId = generateUuid();
            // save to local storage
            setStorageItem('a_anon_id', userId, { ttl: 0 })
        }
    }

    return userId;
}

function attributesForSessionStartType(store, type, userId) {
    var attributes = {};

    attributes.sessionId = generateSessionId(type, userId)
    attributes.startTime = new Date()

    if ([AnalyticsSessionTypes.CHAT, AnalyticsSessionTypes.STACK].indexOf(type) !== -1) {
        let roomPage = new RoomPage(store.getState())
        if (roomPage.isLoaded()) {
            let stack = roomPage.entity()
            attributes.stackId = stack.get('id')
            attributes.stackCreatedAt = format(stack.get('createdAt'))
            attributes.stackAuthorId = stack.author().get('id')
            attributes.stackAuthorUsername = stack.author().get('username')
        }
    }

    return attributes
}

function attributesForSessionStopType(store, type) {
    let analytics = new Analytics(store.getState())
    let session = analytics.getActiveSession(type)
    if (!session) {
        return null;
    }

    let attributes = session.get('attributes').toJS()

    attributes.stopTime = new Date()
    attributes.duration = (attributes.stopTime.getTime() - attributes.startTime.getTime())/1000

    return attributes
}

function attributesForVideoImpression(store, action) {
    let mediaItem = new MediaItemEntity(action.id, store.getState().get('entities'))
    let stack = mediaItem.stack()
    let author = stack.author()

    return {
        startTime: action.startTime,
        endTime: action.endTime,
        duration: action.endTime - action.startTime,
        stackId: stack.get('id'),
        stackCreatedAt: format(stack.get('created_at')),
        mediaitemId: action.id,
        mediaitemAuthorId: author.get('id'),
        mediaitemAuthorUsername: author.get('username'),
        mediaitemDuration: mediaItem.video().get('duration')
    }
}


/*****************
 * ACTION HANDLERS
 *****************/

function startSession(store, next, type) {

    // Only start new session of said type if there is no currently active one
    let analytics = new Analytics(store.getState())
    if (analytics.hasActiveSession(type)) {
        return;
    }

    // generate or find user id
    let userId;
    if (type === AnalyticsSessionTypes.APP) {
        userId = generateUserId(store)
    } else {
        userId = analytics.get('userId')
    }

    let attributes = attributesForSessionStartType(store, type, userId)

    // send session information to reducer
    next({
        type: ActionTypes.ANALYTICS,
        eventType: AnalyticsTypes.SESSION_START,
        sessionType: type,
        userId,
        attributes
    })

    // submit to server
    let submitOptions = {
        sessionType: type,
        userId,
        attributes
    }
    submitEvent(store, AnalyticsTypes.SESSION_START, submitOptions)
}

/**
 * Since we can't really measure when a user is in the chat on the desktop, we 
 * estimate session type by prolonging a session every time the user interacts
 * with the chat in some way (scrolls, types in the text box, etc)
 */
function prolongChatSession(store, next) {
    let analytics = new Analytics(store.getState())
    if (analytics.hasActiveSession(AnalyticsSessionTypes.CHAT)) {
        let timeoutId = analytics.get('chatTimeoutId')
        clearTimeout(timeoutId)
    } else {
        startSession(store, next, AnalyticsSessionTypes.CHAT)
    }

    let timeoutId = setTimeout(() => {
        stopSession(store, next, AnalyticsSessionTypes.CHAT)
    }, CHAT_SESSION_PROLONG_TIME_MSEC)

    next({
        type: ActionTypes.PROLONG_CHAT_SESSION,
        timeoutId
    })
}

function stopSession(store, next, type) {

    // Only end session of said type if there is a currently active one
    let analytics = new Analytics(store.getState())
    if (!analytics.hasActiveSession(type)) {
        return;
    }

    let userId = analytics.get('userId')
    let attributes = attributesForSessionStopType(store, type)

    // send session info to reducer
    next({
        type: ActionTypes.ANALYTICS,
        eventType: AnalyticsTypes.SESSION_STOP,
        sessionType: type,
        userId,
        attributes
    })

    // submit to server
    let submitOptions = {
        sessionType: type,
        userId,
        attributes
    }

    submitEvent(store, AnalyticsTypes.SESSION_STOP, submitOptions)
}

function stopAllSessions(store, next) {
    stopSession(store, next, AnalyticsSessionTypes.APP)
    stopSession(store, next, AnalyticsSessionTypes.CHAT)
    stopSession(store, next, AnalyticsSessionTypes.STACK)
}

function logVideoImpression(store, next, action) {

    let analytics = new Analytics(store.getState())
    let userId = analytics.get('userId')
    let attributes = attributesForVideoImpression(store, action)

    let submitOptions = {
        userId,
        attributes
    }

    submitEvent(store, AnalyticsTypes.VIDEO_IMPRESSION, submitOptions)
}


export default store => next => action => {

    next(action)

    if (typeof window === 'undefined') {
        // client only
        return
    }

    if (action.type === ActionTypes.START_NEW_SESSION) 
    {
        // TODO: restart active chat and stack sessions
        stopSession(store, next, AnalyticsSessionTypes.APP)
        startSession(store, next, AnalyticsSessionTypes.APP)
    } 
    else if (action.type === ActionTypes.STACK && action.status === Status.SUCCESS)
    {
        startSession(store, next, AnalyticsSessionTypes.STACK)
    }
    else if (action.type === ActionTypes.CLEAR_STACK)
    {
        stopSession(store, next, AnalyticsSessionTypes.STACK)
        stopSession(store, next, AnalyticsSessionTypes.CHAT)
    }
    else if (action.type === ActionTypes.USE_CHAT
            || action.type === ActionTypes.PROMPT_CHAT_ACTIONS
            || action.type === ActionTypes.UPDATE_CHAT_MESSAGE) 
    {
        prolongChatSession(store, next)
    }
    else if (action.type === ActionTypes.LOG_VIDEO_IMPRESSION)
    {
        logVideoImpression(store, next, action)
    }
    else if (action.type === ActionTypes.ON_BEFORE_UNLOAD)
    {
        stopAllSessions(store, next)
    }
    else if (action.type === ActionTypes.SEND_PENDING_EVENTS) 
    {
        submitPendingEvents(store)
    }


}