import { assign } from 'lodash'
import { Map } from 'immutable'

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
        options,
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

export function loadStacksForTag(name, options={}) {
    return (dispatch, getState) => {
        const tag = new Tag(getState())
        options = tag.get('filters').merge(Map(options));
        if (!options.equals(tag.get('filters'))) {
            dispatch(clearStacksForTag())
        }
        loadPaginatedObjects('tag', 'stacks', fetchStacksForTag.bind(this, name, options.toJS()), 12)(dispatch, getState)
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
