import ActionTypes from './types'
import Schemas from '../schemas'
import { loadPaginatedObjects } from './utils'
import { API_CALL, API_CANCEL } from './types'

const SEARCH_TYPES = {
    'tags': {
        endpoint: 'tags',
        schema: Schemas.TAGS
    },
    'users': {
        endpoint: 'users',
        schema: Schemas.USERS
    }
}

/**********
 * FETCHING
 **********/

function fetchSearchResults(query, searchType, pagination) {
    console.log(searchType)
    const { endpoint, schema } = SEARCH_TYPES[searchType];
    return {
        type: ActionTypes.SEARCH,
        searchType,
        query,
        [API_CALL]: {
            schema,
            endpoint,
            queries: { q: query },
            pagination
        }
    }
}

export function loadSearchResults(query, searchType) {
    return loadPaginatedObjects('search', searchType, fetchSearchResults.bind(this, query, searchType), 15)
}

/*******
 * RESET
 *******/

export function clearSearch() {
    return {
        type: ActionTypes.CLEAR_SEARCH
    }
}
