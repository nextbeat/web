import { Status } from '../actions'
import { Map, List } from 'immutable'

export default function paginate(type) {

    return function(state = Map(), action) {
        if (action.type === type) {
            switch (action.status) {
                case Status.REQUESTING:
                    return state.merge({
                        isFetching: true
                    });
                case Status.SUCCESS:
                    return state.merge({
                        isFetching: false,
                        ids: state.get('ids', List()).concat(action.response.result),
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