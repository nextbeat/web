import assign from 'lodash/assign'
import flatten from 'lodash/flatten'
import { normalize } from 'normalizr'

import ActionTypes from '../types'
import Schemas from '../../schemas'
import { loadPaginatedObjects } from '../utils'
import { API_CALL, API_CANCEL } from '../types'
import { Section } from '../../models'

/**********
 * FETCHING
 **********/

function fetchSection(slug, pagination) {
    return {
        type: ActionTypes.SECTION,
        slug,
        [API_CALL]: {
            schema: Schemas.STACKS,
            endpoint: `home/${slug}`,
            pagination
        }
    }
}

export function loadSection(slug) {
    return (dispatch, getState) => {
        if (!slug) {
            const section = new Section(getState())
            slug = section.get('slug')
        }
        loadPaginatedObjects(['pages', 'section', 'pagination', 'stacks'], fetchSection.bind(this, slug))(dispatch, getState)
    }
}

/*******
 * RESET
 *******/

export function clearSection(slug) {
    return {
        type: ActionTypes.CLEAR_SECTION,
        slug,
        [API_CANCEL]: {
            actionTypes: [ActionTypes.SECTION]
        }
    }
}