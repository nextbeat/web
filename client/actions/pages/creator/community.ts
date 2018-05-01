import assign from 'lodash-es/assign'

import { 
    ActionType, 
    ApiCallAction, 
    ApiCancelAction,
    GenericAction,
    ThunkAction,
    ApiCall,
    Action
} from '@actions/types'
import { triggerAuthError } from '@actions/app'

import CurrentUser from '@models/state/currentUser'
import * as Schemas from '@schemas'
import Emoji from '@client/models/objects/emoji';

export type CommunityActionAll = 
    ModeratorsAction |
    EmojisAction |
    SelectEmojiFileAction |
    AddEmojiAction |
    RemoveEmojiAction |
    ClearCommunityAction

/************
 * MODERATORS
 ************/

export interface ModeratorsAction extends ApiCallAction {
    type: ActionType.MODERATORS,
    creatorId: number
}
function fetchModerators(creatorId: number): ModeratorsAction {
    return {
        type: ActionType.MODERATORS,
        creatorId,
        API_CALL: {
            endpoint: `users/${creatorId}/moderators`,
            schema: Schemas.Users
        }
    }
}

export function loadModerators(): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()

        if (!CurrentUser.isLoggedIn(state)) {
            return null;
        }

        dispatch(fetchModerators(CurrentUser.get(state, 'id')))
    }
}

/********
 * EMOJIS
 ********/

export interface EmojisAction extends ApiCallAction {
    type: ActionType.EMOJIS
}
function fetchEmojis(creatorId: number): EmojisAction {
    return {
        type: ActionType.EMOJIS,
        API_CALL: {
            endpoint: `users/${creatorId}/emojis`
        }
    }
}

export function loadEmojis(): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()

        if (!CurrentUser.isLoggedIn(state)) {
            return null;
        }

        dispatch(fetchEmojis(CurrentUser.get(state, 'id')))
    }
}

export interface SelectEmojiFileAction extends GenericAction {
    type: ActionType.SELECT_EMOJI_FILE,
    file?: File
}
export function selectEmojiFile(file?: File): SelectEmojiFileAction {
    return {
        type: ActionType.SELECT_EMOJI_FILE,
        file
    }
}

export interface AddEmojiAction extends ApiCallAction {
    type: ActionType.ADD_EMOJI,
    name: string
}
function performAddEmoji(creatorId: number, emoji: EmojiObject): AddEmojiAction {
    return {
        type: ActionType.ADD_EMOJI,
        name: emoji.name,
        API_CALL: {
            endpoint: `users/${creatorId}/emoji`,
            method: 'POST',
            authenticated: true,
            body: assign({}, emoji)
        }
    }
}

interface EmojiObject {
    name: string
    image: string
    width: number
    height: number
}
export function addEmoji(emoji: EmojiObject): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()

        if (!CurrentUser.isLoggedIn(state)) {
            return null;
        }

        dispatch(performAddEmoji(CurrentUser.get(state, 'id'), emoji))
    }
}

export interface RemoveEmojiAction extends ApiCallAction {
    type: ActionType.REMOVE_EMOJI,
    name: string
}
function performRemoveEmoji(creatorId: number, name: string): RemoveEmojiAction {
    return {
        type: ActionType.REMOVE_EMOJI,
        name,
        API_CALL: {
            endpoint: `users/${creatorId}/emoji`,
            method: 'DELETE',
            authenticated: true
        }
    }
}

export function removeEmoji(name: string): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()

        if (!CurrentUser.isLoggedIn(state)) {
            return null;
        }

        dispatch(performRemoveEmoji(CurrentUser.get(state, 'id'), name))
    }
}

/*******
 * CLEAR
 *******/

export interface ClearCommunityAction extends ApiCancelAction {
    type: ActionType.CLEAR_COMMUNITY
}

export function clearCommunity(): ApiCancelAction {
    return {
        type: ActionType.CLEAR_COMMUNITY,
        API_CANCEL: {
            actionTypes: [ActionType.MODERATORS, ActionType.EMOJIS, ActionType.ADD_EMOJI, ActionType.REMOVE_EMOJI]
        }
    }
}