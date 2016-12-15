import { Map, List } from 'immutable'
import { ActionTypes, Status } from '../../../actions'

function promptChatActions(state, action) {
    return state.merge({
        selectedUsername: action.username
    })
}

function updateMessage(state, action) {
    return state.merge({
        message: action.message
    })
}

function commentsMetadata(state, action) {
    if (action.status === Status.SUCCESS) {
        return state.merge({
            bannedUserIds: List(action.response.banned_users).map(u => u.id)
        })
    }
    return state;
}

function banUser(state, action) {
    if (action.status === Status.SUCCESS) {
        return state.update('bannedUserIds', List(), ids => ids.push(action.response.result))
    }
    return state;
}

function unbanUser(state, action) {
    if (action.status === Status.SUCCESS) {
        return state.update('bannedUserIds', List(), ids => ids.filterNot(id => id === action.response.result))
    }
    return state;
}

export default function chat(state=Map(), action) {
    if (action.type === ActionTypes.PROMPT_CHAT_ACTIONS) {
        return promptChatActions(state, action)
    } else if (action.type === ActionTypes.UPDATE_CHAT_MESSAGE) {
        return updateMessage(state, action)
    } else if (action.type === ActionTypes.COMMENTS_METADATA) {
        return commentsMetadata(state, action)
    } else if (action.type === ActionTypes.BAN_USER) {
        return banUser(state, action)
    } else if (action.type === ActionTypes.UNBAN_USER) {
        return unbanUser(state, action)
    }
    return state;
}