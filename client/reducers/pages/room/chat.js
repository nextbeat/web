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

export default function chat(state=Map(), action) {
    if (action.type === ActionTypes.PROMPT_CHAT_ACTIONS) {
        return promptChatActions(state, action)
    } else if (action.type === ActionTypes.MENTION_USER) {
        return mentionUser(state, action)
    } else if (action.type === ActionTypes.CLEAR_CHAT_MESSAGE) {
        return clearChatMessage(state, action)
    }
    return state;
}