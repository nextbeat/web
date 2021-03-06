import { Map, List, Record } from 'immutable'
import mapValues from 'lodash-es/mapValues'

import { Action, ActionType, ApiCallAction, ApiCancelAction, Status } from '@actions/types'
import { State, Reducer } from '@types'

export function combineReducers(reducers: {[key: string]: Reducer<any>}): Reducer<any> {
    return (state = Map(), action) => 
        state.merge(mapValues(reducers, (reducer: Reducer<any>, key: string) => reducer(state.get(key), action)))
}

const defaultPaginationState = Map({
    isFetching: false
})

export function paginate(type: ActionType, clearType?: ActionType): Reducer<State> {

    return function(state=defaultPaginationState, action: Action) {
        if (action.type === type) {
            switch (action.status) {
                case Status.REQUESTING:
                    return state.merge({
                        isFetching: true,
                        beforeDate: action.pagination.beforeDate
                    });
                case Status.SUCCESS:
                    return state.merge({
                        isFetching: false,
                        hasFetched: true,
                        ids: state.get('ids', List()).concat(action.response.result),
                        total: action.response.total,
                        page: action.response.page,
                        limit: action.response.limit
                    });
                case Status.FAILURE:
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

export function entity(type: ActionType): Reducer<State> {

    return function(state: State = Map(), action: Action) {
        if (action.type === type) {
            switch (action.status) {
                case Status.REQUESTING:
                    return state.merge({
                        isFetching: true,
                        hasFetched: false
                    })
                    .delete('error')
                case Status.SUCCESS:
                    return state.merge({
                        isFetching: false,
                        hasFetched: true,
                        id: (action.response as any).result
                    })
                case Status.FAILURE:
                    return state.merge({
                        isFetching: false,
                        error: 'Failed to load.'
                    })
            }
        }
        return state;
    }
}