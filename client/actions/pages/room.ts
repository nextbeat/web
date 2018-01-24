import { List } from 'immutable'
import { normalize } from 'normalizr'

import { 
    ActionType,
    ApiCallAction,
    ApiCancelAction,
    AnalyticsAction,
    GenericAction,
    ThunkAction,
    Pagination
} from '@actions/types'
import { promptModal } from '@actions/app'
import { loadRoom, loadComments,  clearComments, clearRoom } from '@actions/room'
import { joinRoom } from '@actions/eddy'
import { loadPaginatedObjects } from '@actions/utils'
import { Dimensions, Metrics } from '@analytics/definitions'
import RoomPage, { DetailSection } from '@models/state/pages/room'
import * as Schemas from '@schemas'
import { Store, Dispatch } from '@types'

export type RoomPageActionAll = 
    RoomPageAction |
    MoreStacksAction |
    SearchChatAction |
    ClearSearchChatAction |
    HideSearchChatResultsAction |
    SearchSuggestionsAction |
    DeleteStackAction |
    CloseStackAction |
    DeleteMediaItemAction |
    PromptChatActionsAction |
    MentionUserAction |
    ClearChatMessageAction |
    RecordViewAction |
    SelectDetailSectionAction |
    CloseDetailSectionAction |
    RoomShopAction |
    ExpandShopSponsorAction |
    LogShopImpressionAction |
    ClearRoomPageAction 


/**********
 * FETCHING
 **********/

function onRoomPageSuccess(store: Store, next: Dispatch, action: RoomPageAction, response: any) {
    const stack = response.entities.stacks[response.result];
    // Optionally, jump to comment at provided date upon load
    store.dispatch(loadRoom(stack.id, { jumpToCommentAtDate: action.jumpToCommentAtDate }));
    store.dispatch(loadMoreStacks(stack.id))
    store.dispatch(recordView(stack.id)); 

    // TODO: move to room page actions
    if (stack.has_shop_tab) {
        store.dispatch(loadShop(stack.id))
    }
}

export interface RoomPageAction extends ApiCallAction {
    type: ActionType.ROOM_PAGE
    jumpToCommentAtDate?: number
}
function fetchRoomPage(hid: string, jumpToCommentAtDate?: number): RoomPageAction {
    return {
        type: ActionType.ROOM_PAGE,
        jumpToCommentAtDate,
        API_CALL: {
            schema: Schemas.Stack,
            endpoint: `stacks/${hid}`,
            queries: { idAttribute: 'hid' },
            onSuccess: onRoomPageSuccess
        }
    }
}

export function loadRoomPage(hid: string, jumpToCommentAtDate?: number): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()
        if (RoomPage.isLoadedDeep(state)) {
            // Join Eddy room and record view
            const roomId = RoomPage.get(state, 'id')
            dispatch(recordView(roomId))
            dispatch(joinRoom(roomId))
        } else if (!RoomPage.hasErrorDeep(state)) {
            dispatch(fetchRoomPage(hid, jumpToCommentAtDate))
        }
    }
}

export interface MoreStacksAction extends ApiCallAction {
    type: ActionType.MORE_STACKS
    stackId: number
}
export function loadMoreStacks(stackId: number): MoreStacksAction {
    return {
        type: ActionType.MORE_STACKS,
        stackId,
        API_CALL: {
            schema: Schemas.Stacks,
            endpoint: `stacks/${stackId}/more`,
            pagination: { limit: 6, page: 1 }
        }
    }
}

export interface SearchChatAction extends ApiCallAction {
    type: ActionType.SEARCH_CHAT
    roomId: number
    query: string
}
function doSearchChat(roomId: number, query: string, pagination: Pagination): SearchChatAction {
    return {
        type: ActionType.SEARCH_CHAT,
        roomId,
        query,
        API_CALL: {
            schema: Schemas.SearchResultComments,
            endpoint: `stacks/${roomId}/comments/search`,
            queries: { q: query },
            pagination
        }
    }
}

export function searchChat(query?: string, forceUpdate=false): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()
        const roomId = RoomPage.get(state, 'id')
        const lastQuery = RoomPage.get(state, 'searchQuery', '')

        if (!query) {
            query = lastQuery;
        }

        if (lastQuery !== query || forceUpdate) {
            dispatch(clearSearchChat())
        }
        
        loadPaginatedObjects(['pages', 'room', 'chat', 'search'], doSearchChat.bind(this, roomId, query), 20)(dispatch, getState)
    }
}

export interface ClearSearchChatAction extends GenericAction {
    type: ActionType.CLEAR_SEARCH_CHAT
}
export function clearSearchChat(): ClearSearchChatAction {
    return {
        type: ActionType.CLEAR_SEARCH_CHAT
    }
}

export interface HideSearchChatResultsAction extends GenericAction {
    type: ActionType.HIDE_SEARCH_CHAT_RESULTS
}
function doHideSearchChatResults(): HideSearchChatResultsAction {
    return {
        type: ActionType.HIDE_SEARCH_CHAT_RESULTS
    }
}

export function hideSearchChatResults(): ThunkAction {
    return (dispatch) => {
        dispatch(clearSearchChat())
        dispatch(doHideSearchChatResults())
    }
}

export interface SearchSuggestionsAction extends GenericAction {
    type: ActionType.SEARCH_SUGGESTIONS
    roomId: number
}
function fetchSearchSuggestions(roomId: number): SearchSuggestionsAction {
    return {
        type: ActionType.SEARCH_SUGGESTIONS,
        roomId,
        API_CALL: {
            endpoint: `stacks/${roomId}/comments/search/suggestions`,
            queries: { limit: RoomPage.NUM_SEARCH_SUGGESTIONS }
        }
    }
}

export function getSearchSuggestions(): ThunkAction {
    return (dispatch, getState) => {
        const id = RoomPage.get(getState(), 'id')
        dispatch(fetchSearchSuggestions(id))
    }
}


/**************
 * CRUD ACTIONS
 **************/

export interface DeleteStackAction extends ApiCallAction {
    type: ActionType.DELETE_STACK
}
function postDeleteStack(id: number): DeleteStackAction {
    return {
        type: ActionType.DELETE_STACK,
        API_CALL: {
            method: 'DELETE',
            endpoint: `stacks/${id}`,
            authenticated: true
        }
    }
}

export function deleteStack(): ThunkAction {
    return (dispatch, getState) => {
        const id = RoomPage.get(getState(), 'id')
        if (!id || !RoomPage.isCurrentUserAuthor(getState())) {
            return null;
        }
        return dispatch(postDeleteStack(id))
    }
}

function onCloseStackSuccess(store: Store) {
    const newStack = {
        id: RoomPage.get(store.getState(), 'id'),
        closed: true
    }
    store.dispatch({
        type: ActionType.ENTITY_UPDATE,
        response: normalize(newStack, Schemas.Stack)
    })
}

export interface CloseStackAction extends ApiCallAction {
    type: ActionType.CLOSE_STACK
}
function postCloseStack(id: number): CloseStackAction {
    return {
        type: ActionType.CLOSE_STACK,
        API_CALL: {
            method: 'POST',
            endpoint: `stacks/${id}/close`,
            authenticated: true,
            onSuccess: onCloseStackSuccess
        }
    }
}

export function closeStack(): ThunkAction {
    return (dispatch, getState) => {
        const id = RoomPage.get(getState(), 'id')
        if (!id || !RoomPage.isCurrentUserAuthor(getState())) {
            return null;
        }
        return dispatch(postCloseStack(id))
    }
}

export interface DeleteMediaItemAction extends ApiCallAction {
    type: ActionType.DELETE_MEDIA_ITEM
    roomId: number
    id: number
}
function postDeleteMediaItem(roomId: number, id: number): DeleteMediaItemAction {
    return {
        type: ActionType.DELETE_MEDIA_ITEM,
        roomId,
        id,
        API_CALL: {
            method: 'DELETE',
            endpoint: `mediaitems/${id}`,
            authenticated: true
        }
    }
}

export function deleteMediaItem(id: number): ThunkAction {
    return (dispatch, getState) => {
        const roomId = RoomPage.get(getState(), 'id')
        if (!roomId || !RoomPage.isCurrentUserAuthor(getState())) {
            return null;
        }
        return dispatch(postDeleteMediaItem(roomId, id))
    }
}


/******
 * CHAT
 ******/

export interface PromptChatActionsAction extends GenericAction {
    type: ActionType.PROMPT_CHAT_ACTIONS
    username: string
}
function promptChatActions(username: string): PromptChatActionsAction {
    return {
        type: ActionType.PROMPT_CHAT_ACTIONS,
        username
    }
}

export function promptChatActionsForUser(username: string): ThunkAction {
    return (dispatch, getState) => {
        dispatch(promptChatActions(username))
        dispatch(promptModal('chat-user-actions'))
    }
}

export interface MentionUserAction extends GenericAction {
    type: ActionType.MENTION_USER
    username: string
}
export function mentionUser(username: string): MentionUserAction {
    return {
        type: ActionType.MENTION_USER,
        username
    }
}

export interface ClearChatMessageAction extends GenericAction {
    type: ActionType.CLEAR_CHAT_MESSAGE
}
export function clearChatMessage(): ClearChatMessageAction {
    return {
        type: ActionType.CLEAR_CHAT_MESSAGE
    }
}

export function resetChat(): ThunkAction {
    return (dispatch, getState) => {
        const id = RoomPage.get(getState(), 'id')
        dispatch(clearComments(id))
        dispatch(loadComments(id, 'mostRecent'))
    }
}


/*******
 * VIEWS
 *******/

export interface RecordViewAction extends ApiCallAction {
    type: ActionType.RECORD_VIEW
}
export function recordView(stackId: number): RecordViewAction {
    return {
        type: ActionType.RECORD_VIEW,
        API_CALL: {
            method: 'PUT',
            endpoint: `stacks/views/${stackId}`,
            clientOnly: true
        }
    }
}


/**************
 * UI SELECTION
 **************/


export interface SelectDetailSectionAction extends AnalyticsAction {
    type: ActionType.SELECT_DETAIL_SECTION
    section: DetailSection
}
function performSelectDetailSection(roomId: number, section: DetailSection): SelectDetailSectionAction {
    return {
        type: ActionType.SELECT_DETAIL_SECTION,
        section,
        GA: {
            type: 'event',
            category: 'room',
            action: 'select-detail-section',
            label: section,
            [Dimensions.STACK_ID]: roomId,
        }
    }
}

export function selectDetailSection(section: DetailSection): ThunkAction {
    return (dispatch, getState) => {
        const id = RoomPage.get(getState(), 'id')
        dispatch(performSelectDetailSection(id, section))
    }
}

export interface CloseDetailSectionAction extends GenericAction {
    type: ActionType.CLOSE_DETAIL_SECTION
}
export function closeDetailSection(): CloseDetailSectionAction {
    return {
        type: ActionType.CLOSE_DETAIL_SECTION
    }
}


/******
 * SHOP
 ******/

export interface RoomShopAction extends ApiCallAction {
    type: ActionType.ROOM_SHOP
}
function loadShop(stackId: number): RoomShopAction {
    return {
        type: ActionType.ROOM_SHOP,
        API_CALL: {
            method: 'GET',
            endpoint: `stacks/${stackId}/shop`,
            schema: Schemas.Shop
        }
    }
} 

export interface ExpandShopSponsorAction extends AnalyticsAction {
    type: ActionType.EXPAND_SHOP_SPONSOR
    expanded: boolean
}
function performExpandShopSponsor(roomId: number, authorId: number, expanded: boolean): ExpandShopSponsorAction {
    return {
        type: ActionType.EXPAND_SHOP_SPONSOR,
        expanded,
        GA: {
            type: 'event',
            category: 'shop',
            action: expanded ? 'sponsor-expand' : 'sponsor-collapse',
            [Dimensions.STACK_ID]: roomId,
            [Dimensions.AUTHOR_ID]: authorId
        }
    }
}

export function expandShopSponsor(expanded: boolean): ThunkAction {
    return (dispatch, getState) => {
        const roomId = RoomPage.get(getState(), 'id')
        const authorId = RoomPage.author(getState()).get('id')
        dispatch(performExpandShopSponsor(roomId, authorId, expanded))
    }
}


export interface LogShopImpressionAction extends AnalyticsAction {
    type: ActionType.LOG_SHOP_IMPRESSION
}
function performLogShopImpression(roomId: number, authorId: number, duration: number): LogShopImpressionAction {
    return {
        type: ActionType.LOG_SHOP_IMPRESSION,
        GA: {
            type: 'event',
            category: 'shop',
            action: 'track',
            [Metrics.DURATION]: duration,
            [Dimensions.STACK_ID]: roomId,
            [Dimensions.AUTHOR_ID]: authorId
        }
    }
}

export function logShopImpression(duration: number): ThunkAction {
    return (dispatch, getState) => {
        const roomId = RoomPage.get(getState(), 'id')
        const authorId = RoomPage.author(getState()).get('id')
        dispatch(performLogShopImpression(roomId, authorId, duration))
    }
}



/*******
 * RESET
 *******/

export interface ClearRoomPageAction extends ApiCancelAction {
    type: ActionType.CLEAR_ROOM_PAGE
}
function performClearRoomPage() {
    return {
        type: ActionType.CLEAR_ROOM_PAGE,
        API_CANCEL: {
            actionTypes: [ActionType.MORE_STACKS, ActionType.SEARCH_CHAT]
        }
    }
}

export function clearRoomPage(): ThunkAction {
    return (dispatch, getState) => {
        const id = RoomPage.get(getState(), 'id')
        dispatch(clearRoom(id))
        dispatch(performClearRoomPage())
    }
}
