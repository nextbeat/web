import { Map, List } from 'immutable'
import { ActionTypes, Status } from '../../../actions'

function promptChatActions(state, action) {
    return state.merge({
        selectedUsername: action.username
    })
}

function mentionUser(state, action) {
    return state.update('mentions', List(), m => m.push(action.username))
}

function clearChatMessage(state, action) {
    return state.merge({
        mentions: List()
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
        return state.update('bannedUserIds', List(), ids => ids.push(action.responseData.user_id))
    }
    return state;
}

function unbanUser(state, action) {
    if (action.status === Status.SUCCESS) {
        return state.update('bannedUserIds', List(), ids => ids.filterNot(id => id === action.responseData.user_id))
    }
    return state;
}

export default function chat(state=Map(), action) {
    if (action.type === ActionTypes.PROMPT_CHAT_ACTIONS) {
        return promptChatActions(state, action)
    } else if (action.type === ActionTypes.MENTION_USER) {
        return mentionUser(state, action)
    } else if (action.type === ActionTypes.CLEAR_CHAT_MESSAGE) {
        return clearChatMessage(state, action)
    } else if (action.type === ActionTypes.COMMENTS_METADATA) {
        return commentsMetadata(state, action)
    } else if (action.type === ActionTypes.BAN_USER) {
        return banUser(state, action)
    } else if (action.type === ActionTypes.UNBAN_USER) {
        return unbanUser(state, action)
    }
    return state;
}