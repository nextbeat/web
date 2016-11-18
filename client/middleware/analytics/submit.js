import fetch from 'isomorphic-fetch'
import moment from 'moment'
import { assign, snakeCase, mapKeys, isArray, omit } from 'lodash'
import { v4 as generateUuid } from 'node-uuid'
import { List } from 'immutable'
import Promise from 'bluebird'

import { AnalyticsTypes, AnalyticsSessionTypes, ActionTypes, Status } from '../../actions'
import { storageAvailable, getStorageItem, setStorageItem } from '../../utils'
import { Analytics, App } from '../../models'

function isUuid(str) {
    return /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(str)
}

function snakeCaseObjectKeys(object) {
    return mapKeys(object, (val, key) => snakeCase(key))
}

function formatEventData(store, eventType, options) {
    return assign({
        event_type: Analytics.typeString(eventType, options.sessionType),
        user_id: options.userId,
        anonymous: isUuid(options.userId),
        timestamp: moment().format()
    }, 
    snakeCaseObjectKeys(options.attributes))
}

function sendEventsToServer(store, eventData) {
    if (!isArray(eventData)) {
        eventData = [eventData]
    }

    // Add device data to event records here so we don't have to store it
    let app = new App(store.getState()) 
    eventData.forEach(event => {
        assign(event, app.deviceData())
    })

    // console.log('sending events to server', eventData)

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
    let eventData = formatEventData(store, eventType, options)

    // store pending event in local storage
    let pendingEvents = getStorageItem('a_evts') || []
    let storedEventData = assign({ eventId: eventId }, eventData)
    pendingEvents.push(storedEventData)

    setStorageItem('a_evts', pendingEvents)

    // send events to server to be sent to kinesis
    // TODO: rewrite to debounce and send multiple at once
    sendEventsToServer(store, eventData).then(function(success) {
        let pendingEvents = List(getStorageItem('a_evts') || [])
        if (success) {
            // remove pending event from local storage
            pendingEvents = pendingEvents.filterNot(e => e.eventId === eventId).toJS()
        }
        setStorageItem('a_evts', pendingEvents)
    })
}

export function submitPendingEvents(store) {
    let pendingEvents = List(getStorageItem('a_evts') || [])
    if (pendingEvents.size === 0) {
        return;
    }

    pendingEvents = pendingEvents.map(event => omit(event, 'eventId'))

    // send events to server
    sendEventsToServer(store, pendingEvents).then(function(success) {
        if (success) {
            // clear events from local storage
            setStorageItem('a_evts', [])
        }
    })
}