import { Map, List, fromJS } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { 
    ModeratorsAction, 
    AddModeratorAction, 
    RemoveModeratorAction 
} from '@actions/pages/creator/community'
import { State } from '@types'

function moderators(state: State, action: ModeratorsAction) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            isFetchingModerators: true,
            hasFetchedModerators: false
        }).delete('moderatorsError')
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

function addModerator(state: State, action: AddModeratorAction) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            isAddingModerator: true
        }).delete('addModeratorError')
    } else if (action.status === Status.SUCCESS && action.response) {
        return state.merge({
            isAddingModerator: false,
            moderatorIds: state.get('ids', List()).push(action.response.result)
        })
    } else if (action.stats === Status.FAILURE) {
        return state.merge({
            isAddingModerator: false,
            addModeratorError: action.error
        })
    }
    return state
}

function removeModerator(state: State, action: RemoveModeratorAction) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            isRemovingModerator: true
        }).delete('removeModeratorError')
    } else if (action.status === Status.SUCCESS && action.response) {
        return state.merge({
            isRemovingModerator: false,
            moderatorIds: state.get('ids', List()).filter((id: number) => id !== (action.response)!.result)
        })
    } else if (action.stats === Status.FAILURE) {
        return state.merge({
            isRemovingModerator: false,
            removeModeratorError: action.error
        })
    }
    return state
}

export default function (state = Map<string, any>(), action: Action) {
    if (action.type === ActionType.CLEAR_MODERATORS) {
        return Map()
    } else if (action.type === ActionType.MODERATORS) {
        return moderators(state, action)
    } else if (action.type === ActionType.ADD_MODERATOR) {
        return addModerator(state, action)
    } else if (action.type === ActionType.REMOVE_MODERATOR) {
        return removeModerator(state, action)
    }
    return state;
}
