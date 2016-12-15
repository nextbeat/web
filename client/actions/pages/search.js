import ActionTypes from '../types'
import Schemas from '../../schemas'
import { loadPaginatedObjects } from '../utils'
import { API_CALL, API_CANCEL } from '../types'
import { Search } from '../../models'

const SEARCH_TYPES = {
    'tags': {
        endpoint: 'tags',
        schema: Schemas.TAGS
    },
    'users': {
        endpoint: 'users',
        schema: Schemas.USERS
    },
    'stacks': {
        endpoint: 'stacks',
        schema: Schemas.STACKS
    }
}

/**********
 * FETCHING
 **********/

function fetchSearchResults(query, searchType, pagination) {
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
    return (dispatch, getState) => {
        const search = new Search(getState())
        if (searchType !== search.get('searchType')) {
            dispatch(clearSearch())
        }
        loadPaginatedObjects(['pages', 'search', 'pagination', searchType], fetchSearchResults.bind(this, query, searchType), 15)(dispatch, getState)
    }
}

/*******
 * RESET
 *******/

export function clearSearch() {
    return {
        type: ActionTypes.CLEAR_SEARCH
    }
}
