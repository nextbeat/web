import fetch from 'isomorphic-fetch'
import { assign, snakeCase, mapKeys, isArray } from 'lodash'
import { v4 as generateUuid } from 'node-uuid'
import { List } from 'immutable'
import Promise from 'bluebird'

import { AnalyticsTypes, AnalyticsSessionTypes, ActionTypes, Status } from '../../actions'
import { storageAvailable, getStorageItem, setStorageItem } from '../../utils'

function isUuid(str) {
    return /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(str)
}

function snakeCaseObjectKeys(object) {
    return mapKeys(object, (val, key) => snakeCase(key))
}

function typeStringForType(eventType, options) {
    switch (eventType) {
        case AnalyticsTypes.SESSION_START:
            switch (options.sessionType) {
                case AnalyticsSessionTypes.APP:
                    return 'event-session-app-start'
                case AnalyticsSessionTypes.STACK:
                    return 'event-session-stack-start'
                case AnalyticsSessionTypes.CHAT:
                    return 'event-session-chat-start'
            }
        case AnalyticsTypes.SESSION_STOP:
            switch (options.sessionType) {
                case AnalyticsSessionTypes.APP:
                    return 'event-session-app-stop'
                case AnalyticsSessionTypes.STACK:
                    return 'event-session-stack-stop'
                case AnalyticsSessionTypes.CHAT:
                    return 'event-session-chat-stop'
            }
        case AnalyticsTypes.VIDEO_IMPRESSION:
            return 'event-video-impression'
    }
}

function formatEventData(eventType, options) {
    return assign({
        event_type: typeStringForType(eventType, options),
        user_id: options.userId,
        anonymous: isUuid(options.userId)
    }, snakeCaseObjectKeys(options.attributes))
}

function sendEventsToServer(eventData) {
    if (!isArray(eventData)) {
        eventData = [eventData]
    }

    const url = '/api/analytics/events'

    if ('sendBeacon' in navigator) {
        var data = new Blob([JSON.stringify(eventData)], { type: 'application/json; charset=UTF-8' })
        var queued = navigator.sendBeacon(url, data)
        return Promise.resolve(queued);
    } else {
        // if browser doesn't support sendBeacon, use async fetch
        return Promise.resolve().then(() => {
            var options = {
                method: 'PUT',
                body: JSON.stringify(eventData),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin'
            }
            return fetch(url, options)
                .then(() => true)
                .catch(() => false)
        })
    }
}

export function submitEvent(store, eventType, options) {

    if (!storageAvailable('localStorage')) {
        // Currently, analytics are disabled if local storage is unavailable
        return;
    }

    let eventId = generateUuid();
    let eventData = formatEventData(eventType, options)

    // store pending event in local storage
    let pendingEvents = getStorageItem('a_evts') || []
    let storedEventData = assign({ eventId: eventId }, eventData)
    pendingEvents.push(storedEventData)

    setStorageItem('a_evts', pendingEvents)

    // send events to server to be sent to kinesis
    console.log('sending events to server...')
    sendEventsToServer(eventData).then(function(success) {
        if (success) {
            // remove pending event from local storage
            let pendingEvents = List(getStorageItem('a_evts') || [])
            let filteredEvents = pendingEvents.filterNot(e => e.eventId === eventId).toJS()

            setStorageItem('a_evts', filteredEvents)
        }
    })
}

export function submitPendingEvents(store) {
    let pendingEvents = getStorageItem('a_evts') || []
    if (pendingEvents.length === 0) {
        return;
    }

    pendingEvents = pendingEvents.map(event => event.omit('eventId'))

    // send events to server
    sendEventsToServer(eventData).then(function(success) {
        if (success) {
            // clear events from local storage
            setStorageItem('a_evts', [])
        }
    })
}