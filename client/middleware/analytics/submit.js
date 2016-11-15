import { v4 as generateUuid } from 'node-uuid'
import { List } from 'immutable'
import { assign } from 'lodash'
import Promise from 'bluebird'

import { AnalyticsTypes, ActionTypes, Status } from '../../actions'
import { storageAvailable, getStorageItem, setStorageItem } from '../../utils'

export function submitEvent(store, eventData) {
    // send to api server to be routed to kinesis
    // store in localstorage
    // store pending 

    if (!storageAvailable('localStorage')) {
        // Currently, analytics are disabled if local storage is unavailable
        return;
    }

    let eventId = generateUuid();

    // store pending event in local storage
    let pendingEvents = getStorageItem('a_evts') || []
    pendingEvents.push(assign({}, eventData, { eventId }))
    setStorageItem('a_evts', pendingEvents)

    // temporary server simulation (replace with sendBeacon/polyfill)
    Promise.delay(1000).then(function() {
        var success = false // temporary
        console.log('submit to server', success, eventData)
        if (success) {
            // remove pending event from local storage
            let pendingEvents = List(getStorageItem('a_evts') || [])
            let filteredEvents = pendingEvents.filterNot(e => e.eventId === eventId).toJS()
            setStorageItem('a_evts', filteredEvents)
        }
        // todo: if failure, increment failure count?
    })
}

export function submitPendingEvents(store) {
    // TODO
}