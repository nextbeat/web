import { v4 as generateUuid } from 'node-uuid'
import moment from 'moment'

import { ActionTypes, AnalyticsTypes, AnalyticsSessionTypes } from '../../actions' 
import { Stack, Analytics, CurrentUser } from '../../models'
import { getStorageItem, setStorageItem } from '../../utils'

import { submitEvent } from './submit'

/************
 * GENERATORS
 ************/

function generateSessionId(store, type) {
    // TODO
    return 'foo'
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

function attributesForSessionStartType(store, type) {
    var attributes = {};

    attributes.sessionId = generateSessionId(store, type)
    attributes.startTime = new Date()

    if ([AnalyticsSessionTypes.CHAT, AnalyticsSessionTypes.STACK].indexOf(type) !== -1) {
        let stack = new Stack(store.getState())
        if (stack.isLoaded()) {
            attributes.stackId = stack.get('id')
            attributes.stackCreatedAt = moment(stack.get('createdAt')).format()
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
    attributes.duration = attributes.stopTime.getTime() - attributes.startTime.getTime()

    return attributes
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

    let attributes = attributesForSessionStartType(store, type)

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
function prolongChatSession(store, next, type) {

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

function stopAllSessions() {
    // TODO
}


export default store => next => action => {

    // todo: before unload event
    next(action)

    if (action.type === ActionTypes.START_NEW_SESSION) 
    {
        // TODO: restart active chat and stack sessions
        stopSession(store, next, AnalyticsSessionTypes.APP)
        startSession(store, next, AnalyticsSessionTypes.APP)
    } 
    else if (action.type === ActionTypes.STACK)
    {
        startSession(store, next, AnalyticsSessionTypes.STACK)
    }
    else if (action.type === ActionTypes.CLEAR_STACK)
    {
        stopSession(store, next, AnalyticsSessionTypes.STACK)
        stopSession(store, next, AnalyticsSessionTypes.CHAT)
    }
    else if (action.type === ActionTypes.USE_CHAT) 
    {
        prolongChatSession(store, next)
    }
    else if (action.type === ActionTypes.BEFORE_UNLOAD)
    {
        stopAllSessions(store, next)
    }


}