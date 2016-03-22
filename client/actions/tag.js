import { assign } from 'lodash'

import ActionTypes from './types'
import Schemas from '../schemas'
import { Tag } from '../models'
import { loadPaginatedObjects } from './utils'
import { API_CALL, API_CANCEL } from './types'

/**********
 * FETCHING
 **********/

function fetchTag(name) {
    return {
        type: ActionTypes.TAG,
        [API_CALL]: {
            schema: Schemas.TAG,
            endpoint: `tags/${name}`
        }
    }
}

export function loadTag(name) {
    return fetchTag(name);
}

function fetchStacksForTag(tag_name, options, pagination) {
    return {
        type: ActionTypes.TAG_STACKS,
        status: options.status,
        sort: options.sort,
        [API_CALL]: {
            schema: Schemas.STACKS,
            endpoint: "stacks",
            queries: assign({}, options, { tags: tag_name }),
            pagination
        }
    }
}

// private
function clearStacksForTag() {
    return {
        type: ActionTypes.CLEAR_TAG_STACKS,
        [API_CANCEL]: {
            actionTypes: [ActionTypes.TAG_STACKS]
        }
    }
}

export function loadStacksForTag(name, options) {
    return (dispatch, getState) => {
        const tag = new Tag(getState())
        // todo: include status
        if (options.sort !== tag.get('sort')) {
            // we're requesting a new sort type, so we clear the stacks state
            dispatch(clearStacksForTag())
        }
        loadPaginatedObjects('tag', 'stack', fetchStacksForTag.bind(this, name, options), 12)(dispatch, getState)
    }

}

/*******
 * RESET
 *******/

export function clearTag() {
    return {
        type: ActionTypes.CLEAR_TAG,
        [API_CANCEL]: {
            actionTypes: [ActionTypes.TAG_STACKS, ActionTypes.TAG]
        }
    }
}
