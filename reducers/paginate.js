import { Status } from '../actions'
import { union } from 'lodash'
import { Map } from 'immutable'

export default function paginate(type) {

    return function(state = Map(), action) {
        if (action.type === type) {
            switch (action.status) {
                case Status.FETCHING:
                    return state.merge({
                        isFetching: true
                    });
                case Status.SUCCESS:
                    return state.merge({
                        isFetching: false,
                        ids: union(state.get('ids'), action.response.result),
                        total: action.response.total,
                        page: action.response.page
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