import { Map } from 'immutable'
import { ActionTypes, Status } from '../../actions'

export default function meta(state=Map(), action) {
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
                    token: action.user.token,
                    uuid: action.user.uuid
                })
            case Status.FAILURE:
                return state.merge({
                    isLoggingIn: false,
                    loginError: action.error
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
    } else if (action.type === ActionTypes.SIGNUP) {
        switch (action.status) {
            case Status.REQUESTING:
                return state.merge({
                    isSigningUp: true
                })
            case Status.SUCCESS:
                return state.merge({
                    isSigningUp: false
                })
            case Status.FAILURE:
                return state.merge({
                    isSigningUp: false,
                    signupError: action.error
                })
        }
    } else if (action.type === ActionTypes.CLEAR_LOGIN_SIGNUP) {
        return state.merge({
            isSigningUp: false,
            isLoggingIn: false
        }).delete('loginError').delete('signupError');
    }
    return state;
}
