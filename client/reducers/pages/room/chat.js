import { Map, List } from 'immutable'
import { ActionTypes, Status } from '../../../actions'
import { paginate } from '../../utils'

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

function searchChat(state, action) {
    state = state.set('search', paginate(ActionTypes.SEARCH_CHAT, ActionTypes.CLEAR_SEARCH_CHAT)(state.get('search'), action));
    if (action.type === ActionTypes.SEARCH_CHAT) {
        state = state.set('showSearchResults', true)
    }
    if (action.query) {
        state = state.set('searchQuery', action.query)
    }
    return state
}

function hideSearchChatResults(state, action) {
    return state.merge({
        showSearchResults: false
    })
}

export default function chat(state=Map(), action) {
    if (action.type === ActionTypes.PROMPT_CHAT_ACTIONS) {
        return promptChatActions(state, action)
    } else if (action.type === ActionTypes.MENTION_USER) {
        return mentionUser(state, action)
    } else if (action.type === ActionTypes.CLEAR_CHAT_MESSAGE) {
        return clearChatMessage(state, action)
    } else if (action.type === ActionTypes.SEARCH_CHAT || action.type === ActionTypes.CLEAR_SEARCH_CHAT) {
        return searchChat(state, action)
    } else if (action.type === ActionTypes.HIDE_SEARCH_CHAT_RESULTS) {
        return hideSearchChatResults(state, action)
    }
    return state;
}