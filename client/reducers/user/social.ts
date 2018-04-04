import { Map } from 'immutable'

import { RevokeSocialAccountAction } from '@actions/user'
import { Action, ActionType, Status } from '@actions/types'
import { State } from '@types'

function revokeSocialAccount(state: State, action: RevokeSocialAccountAction) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            isRevoking: true
        }).deleteAll(['hasRevoked', 'revokeError'])
    } else if (action.status === Status.SUCCESS) {
        return state.merge({
            isRevoking: false,
            hasRevoked: true
        })
    } else if (action.status === Status.FAILURE) {
        return state.merge({
            isRevoking: false,
            revokeError: action.error
        })
    }
}

export default function social(state: State = Map(), action: Action) {
    if (action.type === ActionType.REVOKE_SOCIAL_ACCOUNT) {
        state = state.update(action.platform, Map(), pState => revokeSocialAccount(pState, action))
    }
    return state;
}