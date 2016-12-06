import { Map, List } from 'immutable'
import mapValues from 'lodash/mapValues'
import { Status } from '../actions'

export function combineReducers(reducers) {
    return function (state = Map(), action) {
        return state.merge(mapValues(reducers, (reducer, key) => reducer(state.get(key), action)));
    }
}

export function paginate(type) {

    return function(state = Map(), action) {
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
        }
        return state;
    }
}

export function entity(type) {

    const initialState = Map({
        isFetching: false,
        id: 0,
        error: ''
    })

    return function(state=initialState, action) {
        if (action.type === type) {
            switch (action.status) {
                case Status.REQUESTING:
                    return state.merge({
                        isFetching: true
                    })
                case Status.SUCCESS:
                    return state.merge({
                        isFetching: false,
                        id: action.response.result
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