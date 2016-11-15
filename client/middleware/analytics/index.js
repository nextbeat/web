import { v4 as generateUuid } from 'node-uuid'

import { ActionTypes, AnalyticsTypes } from '../../actions' 
import { Stack, Analytics, CurrentUser } from '../../models'
import { getStorageItem, setStorageItem } from '../../utils'

import { submitEvent } from './submit'

// Generators

function generateSessionId(store, action) {
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


// Action handlers

function appSessionStart(store, next, action) {

    // Only start new app session if there is no currently active one
    let analytics = new Analytics(store.getState())
    if (analytics.hasActiveSession('app')) {
        return;
    }

    let sessionId = generateSessionId(store, action)
    let userId = generateUserId(store)

    let startTime = new Date()

    // send session information to reducer
    next({
        type: ActionTypes.ANALYTICS,
        eventType: AnalyticsTypes.APP_SESSION_START,
        userId,
        sessionId,
        startTime
    })

    // send to kinesis 
    let eventData = {
        eventType: 'event-session-app-start',
        startTime,
        sessionId
    }

    submitEvent(store, eventData)
}

function appSessionEnd(store, next, action) {

    // Only end app session if there is a currently active one
    let analytics = new Analytics(store.getState())
    if (!analytics.hasActiveSession('app')) {
        return;
    }

    let userId = analytics.get('userId')
    let appSession = analytics.getActiveSession('app')

    let startTime = appSession.get('startTime')
    let stopTime = new Date()
    let duration = stopTime.getTime() - startTime.getTime()
    let sessionId = appSession.get('sessionId')

    // send session info to reducer
    next({
        type: ActionTypes.ANALYTICS,
        eventType: AnalyticsTypes.APP_SESSION_END
    })

    // submit to kinesis
    let eventData = {
        eventType: 'event-session-app-stop',
        startTime,
        stopTime,
        duration,
        sessionId
    }

    submitEvent(store, eventData)
}


export default store => next => action => {

    // todo: before unload event
    next(action)

    switch (action.type) {
        case ActionTypes.START_NEW_SESSION:
            return appSessionStart(store, next, action)
        case ActionTypes.BEFORE_UNLOAD:
            return appSessionEnd(store, next, action)
    }
}