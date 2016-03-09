import { assign } from 'lodash'

import ActionTypes from './types'
import Schemas from '../schemas'
import { loadPaginatedObjects } from './utils'
import { API_CALL } from '../middleware/api'

/**********
 * FETCHING
 **********/

function onChannelSuccess(store, next, action, response) {
    const channel = response.entities.channels[response.result];
    store.dispatch(loadStacksForChannel(channel.id, { sort: "hot" }))
}

function fetchChannel(name) {
    return {
        type: ActionTypes.CHANNEL,
        [API_CALL]: {
            schema: Schemas.CHANNEL,
            endpoint: "channels",
            queries: { name }
        }
    }
}

export function loadChannel(name) {
    return fetchChannel(name);
}

function fetchStacksForChannel(channel_id, options, pagination) {
    return {
        type: ActionTypes.CHANNEL_STACKS,
        status: options.status,
        sort: options.sort,
        [API_CALL]: {
            schema: Schemas.STACKS,
            endpoint: "stacks",
            queries: assign({}, options, { channel: channel_id }),
            pagination
        }
    }
}

export function loadStacksForChannel(channel_id, options) {
    return loadPaginatedObjects('channel', 'stack', fetchStacksForChannel.bind(this, channel_id, options), 12)
}

export function clearChannel() {
    return {
        type: ActionTypes.CLEAR_CHANNEL
    }
}