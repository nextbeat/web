import { Map, List, Record } from 'immutable'
import mapValues from 'lodash-es/mapValues'

import { Action, ActionType } from '@actions/types'

export type State = Map<string, any>
export type Reducer<S> = (state: S, action: Action) => S

export function combineReducers(reducers: Reducer<S>[]): Reducer<State> {
    return (state, action) => 
        state.merge(mapValues(reducers, (reducer: Reducer<State>, key: string) => reducer(state.get(key, Map()), action)))
}


export interface PaginationProps {
    readonly isFetching: boolean
    readonly beforeDate?: number
    readonly ids?: number[]
    readonly total?: number
    readonly page?: number
    readonly limit?: number
    readonly error?: string
}

export type Pagination = Map<keyof PaginationProps, any>

const defaultPaginationState = Map<keyof PaginationProps, any>({
    isFetching: false
})

export function paginate(type: ActionType, clearType?: ActionType): Reducer<Pagination> {

    return function(state=defaultPaginationState, action) {
        if (action.type === type) {
            switch (action.status) {
                case "requesting":
                    return state.merge<keyof PaginationProps, any>({
                        isFetching: true,
                        beforeDate: action.pagination.beforeDate
                    });
                case "success":
                    return state.merge<keyof PaginationProps, any>({
                        isFetching: false,
                        hasFetched: true,
                        ids: state.get('ids', List()).concat(action.response.result),
                        total: action.response.total,
                        page: action.response.page,
                        limit: action.response.limit
                    });
                case "failure":
                    return state.merge<keyof PaginationProps, any>({
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


export interface EntityProps {
    readonly isFetching: boolean
    readonly id: number
    readonly error?: string
}

export type Entity = Map<keyof EntityProps, any>

export function entity(type: ActionType): Reducer<Entity> {

    return function(state=Map(), action) {
        if (action.type === type) {
            switch (action.status) {
                case "requesting":
                    return state.merge<keyof EntityProps, any>({
                        isFetching: true
                    })
                case "success":
                    return state.merge<keyof EntityProps, any>({
                        isFetching: false,
                        id: action.response.result
                    })
                case "failure":
                    return state.merge<keyof EntityProps, any>({
                        isFetching: false,
                        error: 'Failed to load.'
                    })
            }
        }
        return state;
    }
}