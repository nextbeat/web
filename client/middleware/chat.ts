import assign from 'lodash-es/assign'

import { triggerAuthError } from '@actions/app'
import { 
    roomBan,
    roomUnban,
    slashCommandResponse
} from '@actions/room'
import {
    creatorBan,
    creatorUnban,
    mod,
    unmod
} from '@actions/user'
import { receiveComment } from '@actions/eddy'
import { ActionType, Action } from '@actions/types'

import Room from '@models/state/room'
import CurrentUser from '@models/state/currentUser'
import { Store, Dispatch, State } from '@types'
import { generateUuid } from '@utils'

function parseSlashCommand(roomId: number, creatorId: number, message: string): Action | null {
    let isSlashCommand  = /^\/(\w+)/.test(message)
    let re              = /^\/(\w+)(\s+(\w+))?$/.exec(message)
    const helpMessage   = "Available slash commands are /banroom, /unbanroom, /ban, /unban, /mod, /unmod, /help"
    const errorMessage  = "This is not a valid command. Type /help for a list of supported commands."

    if (!isSlashCommand) {
        return null; 
    }

    if (!re) {
        // Slash command is not formatted correctly
        return slashCommandResponse(roomId, errorMessage)
    }

    const command = re[1]
    if (!re[3]) {
        if (command === 'help') {
            return slashCommandResponse(roomId, helpMessage)
        }
    } else {
        const value = re[3]
        switch (command) {
            case 'banroom':
                return roomBan(roomId, value)
            case 'unbanroom':
                return roomUnban(roomId, value)
            case 'ban':
                return creatorBan(creatorId, value, roomId)
            case 'unban':
                return creatorUnban(creatorId, value, roomId)
            case 'mod':
                return mod(creatorId, value, roomId)
            case 'unmod':
                return unmod(creatorId, value, roomId)
        }
    }

    return slashCommandResponse(roomId, errorMessage)
}

export default (store: Store) => (next: Dispatch) => (action: Action) => {

    const state = store.getState();

    if (action.type === ActionType.SEND_COMMENT)
    {
        if (action.message.trim().length === 0) {
            return
        }

        if (!CurrentUser.isLoggedIn(state)) {
            store.dispatch(triggerAuthError())
            return
        }

        // Parse comment; perform action if slash comment
        const roomId = action.roomId
        const creatorId = Room.author(state, roomId).get('id')
        const slashAction = parseSlashCommand(roomId, creatorId, action.message)
        if (slashAction) {
            store.dispatch(slashAction as any)
            return
        }

        // Otherwise, comment is regular message. Continue
        // passing through the middleware chain.
        const username = CurrentUser.entity(state).get('username')
        const temporaryId = generateUuid()
        const createdAt = new Date()

        return next(assign(action, {
            username,
            temporaryId,
            createdAt
        }))
    }
    else if (action.type === ActionType.RESEND_COMMENT) 
    {
        // Construct new comment with same temporary id and send
        let comment = action.comment
        return next({
            type: ActionType.SEND_COMMENT,
            roomId: action.roomId,
            message: comment.get('message'),
            username: comment.get('username'),
            temporaryId: comment.get('temporary_id'),
            createdAt: new Date()
        })
    }
    else if (action.type === ActionType.SLASH_COMMAND_RESPONSE) 
    {
        // Treat the response as a nextbot message received by eddy.
        // This is kind of hacky, but works. Essentially we're pretending
        // like we've received a message from the server, even though
        // it only exists on the client.
        let comment = {
            id: generateUuid(),
            stack_id: action.roomId,
            created_at: (new Date()).toISOString(),
            message: action.message,
            type: 'message',
            subtype: 'private',
            user_mentions: [],
            author: {
                username: 'nextbot',
                id: -1,
                badge: 'bot'
            }
        }
        return store.dispatch(receiveComment(action.roomId, comment))
    }
    else
    {
        return next(action);
    }
}