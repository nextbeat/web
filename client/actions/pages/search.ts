import {
    ActionType,
    ApiCallAction,
    GenericAction,
    ThunkAction,
    Pagination
} from '@actions/types'
import { loadPaginatedObjects } from '@actions/utils'
import * as Schemas from '@schemas'
import Search, { SearchType } from '@models/state/pages/search'

const SEARCH_TYPES = {
    'tags': {
        endpoint: 'tags',
        schema: Schemas.Tag
    },
    'users': {
        endpoint: 'users',
        schema: Schemas.Users
    },
    'stacks': {
        endpoint: 'stacks',
        schema: Schemas.Stack
    }
}

export type SearchActionAll = 
    SearchAction |
    ClearSearchAction

/**********
 * FETCHING
 **********/

export interface SearchAction extends ApiCallAction {
    type: ActionType.SEARCH
    searchType: SearchType
    query: string
}
function fetchSearchResults(query: string, searchType: SearchType, pagination: Pagination) {
    const { endpoint, schema } = SEARCH_TYPES[searchType];
    return {
        type: ActionType.SEARCH,
        searchType,
        query,
        API_CALL: {
            schema,
            endpoint,
            queries: { q: query },
            pagination
        }
    }
}

export function loadSearchResults(query: string, searchType: SearchType): ThunkAction {
    return (dispatch, getState) => {
        if (searchType !== Search.get(getState(), 'searchType')) {
            dispatch(clearSearch())
        }
        loadPaginatedObjects(['pages', 'search', 'pagination', searchType], fetchSearchResults.bind(this, query, searchType), 15)(dispatch, getState)
    }
}

/*******
 * RESET
 *******/

export interface ClearSearchAction extends GenericAction {
    type: ActionType.CLEAR_SEARCH
}
export function clearSearch() {
    return {
        type: ActionType.CLEAR_SEARCH
    }
}
