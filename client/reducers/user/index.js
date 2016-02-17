import { Map } from 'immutable'
import * as ActionTypes from '../../actions'
import { Status } from '../../actions'
import live from './live'
import { combineReducers } from '../utils'

function meta(state=Map(), action) {
    if (action.type === ActionTypes.LOGIN) {
        switch (action.status) {
            case Status.REQUESTING:
                return state.merge({
                    isLoggingIn: true
                })
            case Status.SUCCESS:
                return state.merge({
                    isLoggingIn: false,
                    id: action.user.id,
                    username: action.user.username,
                    token: action.user.token
                })
            case Status.FAILURE:
                return state.merge({
                    isLoggingIn: false,
                    error: action.error
                })
        }
    } else if (action.type === ActionTypes.LOGOUT) {
        switch (action.status) {
            case Status.REQUESTING:
                return state.merge({
                    isLoggingOut: true
                })
            case Status.SUCCESS:
                return state.set('isLoggingOut', false)
                    .delete('id')
                    .delete('token')
                    .delete('username');
            case Status.FAILURE:
                return state.merge({
                    isLoggingOut: false
                })
        }
    }
    return state;
}

export default combineReducers({
    meta,
    live
})
