import { Map } from 'immutable'
import { Dispatch } from 'react-redux'

import { Action, Pagination } from '@actions/types'

// todo: api server should handle stack_id inputs
// todo: return nextUrl in api server?

type ActionFn = (pagination: Pagination) => Action
type PaginationThunk = (dispatch: Dispatch, getState: () => Map<string, any>) => void 

export function loadPaginatedObjects(keyPath: string[], action: ActionFn, defaultLimit = 20): PaginationThunk {
    return (dispatch, getState) => {

        const { 
            page = 0, 
            limit = defaultLimit, 
            total = -1,
            beforeDate = Date.now(),
            ids = []
        } = getState().getIn(keyPath, Map()).toJS()

        if (total >= 0 && total <= ids.length) {
            // reached the end of the list of objects
            return null;
        }

        const pagination = {
            page: page+1,
            limit,
            beforeDate
        };

        dispatch(action(pagination));
    }
}