import { Map, List, fromJS } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { 
    EmojisAction, 
    SelectEmojiFileAction,
    SetEmojiFileErrorAction,
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
        file: action.file,
        fileError: undefined
    })
}

function setEmojiFileError(state: State, action: SetEmojiFileErrorAction) {
    return state.merge({
        fileError: action.error,
        file: undefined
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
    } else if (action.type === ActionType.SET_EMOJI_FILE_ERROR) {
        return setEmojiFileError(state, action)
    } else if (action.type === ActionType.ADD_EMOJI) {
        return addEmoji(state, action)
    } else if (action.type === ActionType.REMOVE_EMOJI) {
        return removeEmoji(state, action)
    }
    return state;
}
