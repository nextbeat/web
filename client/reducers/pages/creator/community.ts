import { Map, List, fromJS } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { ModeratorsAction } from '@actions/pages/creator/community'
import { ModAction, UnmodAction } from '@actions/user'
import { State } from '@types'

function moderators(state: State, action: ModeratorsAction) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            isFetchingModerators: true,
            hasFetchedModerators: false
        }).deleteAll(['moderatorsError', 'addModeratorError', 'removeModeratorError'])
    } else if (action.status === Status.SUCCESS && action.response) {
        return state.merge({
            isFetchingModerators: false,
            hasFetchedModerators: true,
            moderatorIds: fromJS(action.response.result)
        })
    } else if (action.stats === Status.FAILURE) {
        return state.merge({
            hasFetchedModerators: false,
            moderatorError: action.error
        })
    }
    return state
}

function addModerator(state: State, action: ModAction) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            isAddingModerator: true
        }).deleteAll(['moderatorsError', 'addModeratorError', 'removeModeratorError'])
    } else if (action.status === Status.SUCCESS) {
        return state.merge({
            isAddingModerator: false
        })
    } else if (action.status === Status.FAILURE) {
        return state.merge({
            isAddingModerator: false,
            addModeratorError: action.error
        })
    }
    return state
}

function removeModerator(state: State, action: UnmodAction) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            isRemovingModerator: true
        }).deleteAll(['moderatorsError', 'addModeratorError', 'removeModeratorError'])
    } else if (action.status === Status.SUCCESS) {
        return state.merge({
            isRemovingModerator: false
        })
    } else if (action.status === Status.FAILURE) {
        return state.merge({
            isRemovingModerator: false,
            removeModeratorError: action.error
        })
    }
    return state
}

export default function (state = Map<string, any>(), action: Action) {
    if (action.type === ActionType.CLEAR_COMMUNITY) {
        return Map()
    } else if (action.type === ActionType.MODERATORS) {
        return moderators(state, action)
    } else if (action.type === ActionType.MOD) {
        return addModerator(state, action)
    } else if (action.type === ActionType.UNMOD) {
        return removeModerator(state, action)
    }
    return state;
}
