import { Map, List, fromJS } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { 
    EmojisAction, 
    SelectEmojiFileAction,
    AddEmojiAction, 
    RemoveEmojiAction 
} from '@actions/pages/creator/community'
import { State } from '@types'

function emojis(state: State, action: EmojisAction) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            isFetching: true,
            hasFetched: false
        }).deleteAll(['error', 'addError', 'removeError'])
    } else if (action.status === Status.SUCCESS && action.response) {
        return state.merge({
            isFetching: false,
            hasFetched: true,
            emojis: fromJS(action.response)
        })
    } else if (action.stats === Status.FAILURE) {
        return state.merge({
            hasFetched: false,
            error: action.error
        })
    }
    return state
}

function selectEmojiFile(state: State, action: SelectEmojiFileAction) {
    return state.merge({
        file: action.file
    })
}

function addEmoji(state: State, action: AddEmojiAction) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            isAdding: true
        }).deleteAll(['error', 'addError', 'removeError'])
    } else if (action.status === Status.SUCCESS) {
        return state.merge({
            isAdding: false
        })
    } else if (action.status === Status.FAILURE) {
        return state.merge({
            isAdding: false,
            addError: action.error
        })
    }
    return state
}

function removeEmoji(state: State, action: RemoveEmojiAction) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            isRemoving: true
        }).deleteAll(['error', 'addError', 'removeError'])
    } else if (action.status === Status.SUCCESS) {
        return state.merge({
            isRemoving: false
        })
    } else if (action.status === Status.FAILURE) {
        return state.merge({
            isRemoving: false,
            removeError: action.error
        })
    }
    return state
}

export default function (state = Map<string, any>(), action: Action) {
    if (action.type === ActionType.CLEAR_COMMUNITY) {
        return Map()
    } else if (action.type === ActionType.EMOJIS) {
        return emojis(state, action)
    } else if (action.type === ActionType.SELECT_EMOJI_FILE) {
        return selectEmojiFile(state, action)
    } else if (action.type === ActionType.ADD_EMOJI) {
        return addEmoji(state, action)
    } else if (action.type === ActionType.REMOVE_EMOJI) {
        return removeEmoji(state, action)
    }
    return state;
}
