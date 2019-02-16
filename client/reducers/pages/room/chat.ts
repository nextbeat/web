import { Map, List } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { 
    PromptChatActionsAction, 
    MentionUserAction, 
    ClearChatMessageAction, 
    SearchChatAction,
    HideSearchChatResultsAction,
    SearchSuggestionsAction,
    ClearSearchChatAction,
    InsertEmojiAction
} from '@actions/pages/room'
import { paginate } from '@reducers/utils'
import { State } from '@types'

function promptChatActions(state: State, action: PromptChatActionsAction) {
    return state.merge({
        selectedUsername: action.username
    })
}

function mentionUser(state: State, action: MentionUserAction) {
    return state.update('mentions', List(), m => m.push(action.username))
}

function insertEmoji(state: State, action: InsertEmojiAction) {
    return state.update('emojis', List(), e => e.push(action.name))
}

function clearChatMessage(state: State, action: ClearChatMessageAction) {
    return state.merge({
        mentions: List(),
        emojis: List()
    })
}

function searchChat(state: State, action: SearchChatAction | ClearSearchChatAction) {
    state = state.set('search', paginate(ActionType.SEARCH_CHAT, ActionType.CLEAR_SEARCH_CHAT)(state.get('search'), action));
    if (action.type === ActionType.SEARCH_CHAT) {
        state = state.set('showSearchResults', true)
        if (action.status === Status.SUCCESS && action.query) {
            state = state.update('searchHistory', List(), history => history.unshift(action.query).toOrderedSet().toList().take(3))
        }
    }
    if (action.query) {
        state = state.set('searchQuery', action.query)
    }
    return state
}

function hideSearchChatResults(state: State, action: HideSearchChatResultsAction) {
    return state.merge({
        showSearchResults: false
    })
}

function searchSuggestions(state: State, action: SearchSuggestionsAction) {
    if (action.status === Status.REQUESTING) {
        return state.update('searchSuggestions', Map(), s => s.merge({
                terms: List(),
                isFetching: true,
                hasFetched: false
            }).delete('searchSuggestionsError')
        );
    } else if (action.status === Status.SUCCESS) {
         return state.update('searchSuggestions', Map(), s => s.merge({
                terms: List(action.response),
                isFetching: false,
                hasFetched: true
            })
         );
    } else if (action.status === Status.FAILURE) {
         return state.update('searchSuggestions', Map(), s => s.merge({
                isFetching: false,
                error: action.error
            })
        );
    }
    return state
}

export default function chat(state=Map<string, any>(), action: Action) {
    if (action.type === ActionType.PROMPT_CHAT_ACTIONS) {
        return promptChatActions(state, action)
    } else if (action.type === ActionType.MENTION_USER) {
        return mentionUser(state, action)
    } else if (action.type === ActionType.INSERT_EMOJI) {
        return insertEmoji(state, action)
    } else if (action.type === ActionType.CLEAR_CHAT_MESSAGE) {
        return clearChatMessage(state, action)
    } else if (action.type === ActionType.SEARCH_CHAT || action.type === ActionType.CLEAR_SEARCH_CHAT) {
        return searchChat(state, action)
    } else if (action.type === ActionType.HIDE_SEARCH_CHAT_RESULTS) {
        return hideSearchChatResults(state, action)
    } else if (action.type === ActionType.SEARCH_SUGGESTIONS) {
        return searchSuggestions(state, action)
    }
    return state;
}