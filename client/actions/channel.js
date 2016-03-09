import { assign } from 'lodash'

import ActionTypes from './types'
import Schemas from '../schemas'
import { Channel } from '../models'
import { loadPaginatedObjects } from './utils'
import { API_CALL } from '../middleware/api'

/**********
 * FETCHING
 **********/

function onChannelSuccess(store, next, action, response) {
    store.dispatch(loadStacksForChannel({ sort: "hot" }))
}

function fetchChannel(name) {
    return {
        type: ActionTypes.CHANNEL,
        [API_CALL]: {
            schema: Schemas.CHANNEL,
            endpoint: "channels",
            queries: { name },
            onSuccess: onChannelSuccess
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

function clearStacksForChannel() {
    return {
        type: ActionTypes.CLEAR_CHANNEL_STACKS
    }
}

export function loadStacksForChannel(options) {
    return (dispatch, getState) => {
        const channel = new Channel(getState())
        // todo: include status
        if (options.sort !== channel.get('sort')) {
            // we're requesting a new sort type, so we clear the stacks state
            dispatch(clearStacksForChannel())
        }
        loadPaginatedObjects('channel', 'stack', fetchStacksForChannel.bind(this, channel.get('id'), options), 12)(dispatch, getState)
    }

}

export function clearChannel() {
    return {
        type: ActionTypes.CLEAR_CHANNEL
    }
}