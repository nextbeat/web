import { Map, List, Record } from 'immutable'
import mapValues from 'lodash-es/mapValues'

import { Action, ActionTypeKey, ApiCallAction, ApiCancelAction } from '@actions/types'
import { State, Reducer } from '@types'

export function combineReducers(reducers: {[key: string]: Reducer}): Reducer {
    return (state, action) => 
        state.merge(mapValues(reducers, (reducer: Reducer, key: string) => reducer(state.get(key, Map()), action)))
}

const defaultPaginationState = Map({
    isFetching: false
})

export function paginate(type: ActionTypeKey, clearType?: ActionTypeKey): Reducer {

    return function(state=defaultPaginationState, action: ApiCallAction | ApiCancelAction) {
        if (action.type === type) {
            switch (action.status) {
                case "requesting":
                    return state.merge({
                        isFetching: true,
                        beforeDate: action.pagination.beforeDate
                    });
                case "success":
                    return state.merge({
                        isFetching: false,
                        hasFetched: true,
                        ids: state.get('ids', List()).concat(action.response.result),
                        total: action.response.total,
                        page: action.response.page,
                        limit: action.response.limit
                    });
                case "failure":
                    return state.merge({
                        isFetching: false,
                        error: 'Failed to load.'
                    });
            }
        } else if (clearType && action.type === clearType) {
            return defaultPaginationState
        }
        return state;
    }
}

export function entity(type: ActionTypeKey): Reducer {

    return function(state: State, action: ApiCallAction) {
        if (action.type === type) {
            switch (action.status) {
                case "requesting":
                    return state.merge({
                        isFetching: true
                    })
                case "success":
                    return state.merge({
                        isFetching: false,
                        id: action.response.result
                    })
                case "failure":
                    return state.merge({
                        isFetching: false,
                        error: 'Failed to load.'
                    })
            }
        }
        return state;
    }
}