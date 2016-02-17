import { Status } from '../actions'
import { Map } from 'immutable'

export default function entity(type) {

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
                case Status.RESET:
                    return initialState
            }
        }
        return state;
    }
}