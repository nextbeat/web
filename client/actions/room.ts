import { List, fromJS } from 'immutable'
import { normalize } from 'normalizr'
import { browserHistory } from 'react-router'
import * as format from 'date-fns/format'
import assign from 'lodash-es/assign'
import values from 'lodash-es/values'

import { Store, Dispatch } from '@types' 
import { 
    ActionType, 
    ApiCallAction, 
    ApiCancelAction, 
    AnalyticsAction,
    GenericAction, 
    ThunkAction, 
    Pagination 
} from '@actions/types'
import { triggerAuthError } from '@actions/app'
import { loadPaginatedObjects } from '@actions/utils'
import { selectDetailSection } from '@actions/pages/room'
import Comment from '@models/entities/comment'
import TemporaryComment from '@models/entities/temporary/comment'
import Room, { FetchDirection } from '@models/state/room'
import RoomPage from '@models/state/pages/room'
import CurrentUser from '@models/state/currentUser'
import * as Schemas from '@schemas'
import { generateUuid, setStorageItem } from '@utils'

const COMMENTS_PAGE_SIZE = 40;

export type RoomActionAll = 
    RoomAction |
    MediaItemsAction |
    RoomInfoAction |
    DeselectCommentAction |
    GoToCommentAction |
    CommentsAction |
    SendCommentAction |
    PinCommentAction |
    UnpinCommentAction |
    BanUserAction |
    UnbanUserAction |
    UseChatAction |
    BookmarkAction |
    UnbookmarkAction |
    DidPlayVideoAction |
    SelectMediaItemAction |
    MarkStackAction |
    ClearCommentsAction |
    ClearRoomAction

/**********
 * FETCHING
 **********/

export interface RoomAction extends ApiCallAction {
    type: ActionType.ROOM,
    roomId: number
}
function fetchRoom(id: number): RoomAction {
    return {
        type: ActionType.ROOM,
        roomId: id,
        API_CALL: {
            schema: Schemas.Stack,
            endpoint: `stacks/${id}`
        }
    }
}

interface LoadRoomOptions {
    jumpToCommentAtDate?: number // date in seconds
}
export function loadRoom(id: number, options: LoadRoomOptions = {}): ThunkAction {
    return dispatch => {
        dispatch(fetchRoom(id))
        dispatch(loadMediaItems(id));
        dispatch(loadComments(id, 'mostRecent', { jumpTo: options.jumpToCommentAtDate }));
    }
}

export interface MediaItemsAction extends ApiCallAction {
    type: ActionType.MEDIA_ITEMS
    roomId: number
}
function fetchMediaItems(roomId: number, pagination: Pagination): MediaItemsAction {
    return {
        type: ActionType.MEDIA_ITEMS,
        roomId,
        API_CALL: {
            schema: Schemas.MediaItems,
            endpoint: `stacks/${roomId}/mediaitems`,
            pagination
        }
    }
}

export function loadMediaItems(roomId: number) {
    let keyPath = ['rooms', roomId, 'pagination', 'mediaItems']
    let fetchFn = (pagination: Pagination) => fetchMediaItems(roomId, pagination)

    return loadPaginatedObjects(keyPath, fetchFn, "all");
}

export interface RoomInfoAction extends GenericAction {
    type: ActionType.ROOM_INFO
    roomId: number
}
export function getRoomInfo(roomId: number): RoomInfoAction {
    return {
        type: ActionType.ROOM_INFO,
        roomId
    }
}


/* Comments */

export interface DeselectCommentAction extends GenericAction {
    type: ActionType.DESELECT_COMMENT
    roomId: number
}
function deselectComment(roomId: number): DeselectCommentAction {
    return {
        type: ActionType.DESELECT_COMMENT,
        roomId
    }
}

export interface GoToCommentAction extends GenericAction {
    type: ActionType.GO_TO_COMMENT
    roomId: number
    comment: any
}
function performGoToComment(roomId: number, comment: any): GoToCommentAction {
    return {
        type: ActionType.GO_TO_COMMENT,
        roomId,
        comment
    }
}

function goToComment(roomId: number, comment: object): ThunkAction {
    return dispatch => {
        dispatch(deselectComment(roomId))
        process.nextTick(() => {
            dispatch(performGoToComment(roomId, comment))
        })
    }
}

function commentClosestToDate(date: number, response: any) {
    let comments = response.entities.comments

    let comment = values(comments)
        .filter(c => c.type === "message")
        .sort((a, b) => Math.abs(
            (new Date(a.created_at)).getTime()-date*1000) - Math.abs((new Date(b.created_at)).getTime()-date*1000)
        )[0]
    return new Comment(parseInt(comment.id, 10), fromJS(response.entities))
}

function onFetchCommentSuccess(store: Store, next: Dispatch, action: CommentsAction, response: any) {
    if (action.fetchType === 'around') {
        let comment = action.comment
        if (!comment) {
            comment = commentClosestToDate(action.date, response)
            // Force open chat section if in mobile res
            store.dispatch(selectDetailSection('chat'))
        }
        store.dispatch(goToComment(action.roomId, comment))
    } else if (action.fetchType === 'mostRecent' && action.jumpTo) {
        const queries = {
            around: action.jumpTo
        }
        store.dispatch(fetchComments(action.roomId, queries, { fetchType: 'around', jumpTo: action.jumpTo }))
    }
}

interface FetchCommentsOptions {
    fetchType: FetchDirection
    jumpTo?: number
}
export interface CommentsAction extends ApiCallAction {
    type: ActionType.COMMENTS
    roomId: number
    fetchType: FetchDirection
    jumpTo?: number
}
function fetchComments(roomId: number, queries: any, options: FetchCommentsOptions): CommentsAction {
    return {        
        type: ActionType.COMMENTS,
        roomId,
        fetchType: options.fetchType,
        jumpTo: options.jumpTo,
        API_CALL: {
            schema: Schemas.Comments,
            endpoint: `stacks/${roomId}/comments`,
            pagination: {
                limit: COMMENTS_PAGE_SIZE,
                page: 1
            },
            queries,
            onSuccess: onFetchCommentSuccess
        }
    }
}

interface LoadCommentsOptions {
    jumpTo?: number // date in seconds
}
export function loadComments(roomId: number, direction: FetchDirection, options: LoadCommentsOptions = {}): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()
        if (direction === 'before') {
            if (Room.get(state, roomId, 'hasReachedOldestComment')) {
                return null;
            }
            const queries = {
                before: (Room.comments(state, roomId).last() as Comment).get('created_at')
            }
            return dispatch(fetchComments(roomId, queries, { fetchType: 'before' }));
        } else if (direction === 'after') {
            if (Room.get(state, roomId, 'hasReachedLatestComment')) {
                return null;
            }
            const queries = {
                after: (Room.comments(state, roomId).first() as Comment).get('created_at')
            }
            return dispatch(fetchComments(roomId, queries, { fetchType: 'after' }));
        } else if (direction === 'mostRecent') {
            const queries = {
                before: format(Date.now())
            };
            return dispatch(fetchComments(roomId, queries, { fetchType: 'mostRecent', jumpTo: options.jumpTo }));
        }
    }
}

export function jumpToComment(roomId: number, comment: Comment): ThunkAction {
    return (dispatch, getState) => {
        if (Room.hasLoadedComment(getState(), roomId, comment)) {
            dispatch(goToComment(roomId, comment))
        } else {
            const queries = {
                around: (new Date(comment.get('created_at'))).getTime() / 1000
            }
            dispatch(fetchComments(roomId, queries, { fetchType: 'around', jumpTo: queries.around }))
        }
    }
}


/******
 * CHAT
 ******/

interface SendCommentOptions {
    roomId: number,
    temporaryId: string,
    message: string,
    username: string,
    createdAt: Date
}
export interface SendCommentAction extends AnalyticsAction, SendCommentOptions {
    type: ActionType.SEND_COMMENT
}
function performSendComment(options: SendCommentOptions): SendCommentAction {
    return {
        type: ActionType.SEND_COMMENT,
        temporaryId: options.temporaryId,
        roomId: options.roomId,
        message: options.message,
        username: options.username,
        createdAt: options.createdAt,
        GA: {
            type: 'event',
            category: 'chat',
            action: 'send',
            label: options.roomId
        }
    }
}

export function sendComment(roomId: number, message: string): ThunkAction {
    return (dispatch, getState) => {

        if (!message || message.trim().length === 0) {
            return null;
        }

        if (!CurrentUser.isLoggedIn(getState())) {
            return dispatch(triggerAuthError())
        } else {
            let username = CurrentUser.entity(getState()).get('username')
            let temporaryId = generateUuid()
            let createdAt = new Date()
            return dispatch(performSendComment({ message, roomId, username, temporaryId, createdAt }));
        }
    }
}

export function resendComment(roomId: number, comment: TemporaryComment): SendCommentAction {
    let newComment = {
        roomId,
        message: comment.get('message'),
        username: comment.get('username'),
        temporaryId: comment.get('temporary_id'),
        createdAt: new Date()
    }
    return performSendComment(newComment)
}

export interface PinCommentAction extends GenericAction {
    type: ActionType.PIN_COMMENT
    roomId: number
    message: string
}
function performPinComment(roomId: number, message: string): PinCommentAction {
    return {
        type: ActionType.PIN_COMMENT,
        roomId,
        message
    }
}

export function pinComment(roomId: number, message: string): ThunkAction {
    return (dispatch, getState) => {

        if (!message || message.trim().length === 0) {
            return null;
        }

        if (!Room.isCurrentUserAuthor(getState(), roomId)) {
            return null;
        }

        dispatch(performPinComment(roomId, message))
    }
}

export interface UnpinCommentAction extends GenericAction {
    type: ActionType.UNPIN_COMMENT
    roomId: number
}
function performUnpinComment(roomId: number): UnpinCommentAction {
    return {
        type: ActionType.UNPIN_COMMENT,
        roomId
    }
}

export function unpinComment(roomId: number): ThunkAction {
    return (dispatch, getState) => {
        if (!Room.isCurrentUserAuthor(getState(), roomId)) {
            return null;
        }
        dispatch(performUnpinComment(roomId))
    }
}

export interface BanUserAction extends GenericAction {
    type: ActionType.BAN_USER
    roomId: number
    username: string
}
function performBanUser(roomId: number, username: string): BanUserAction {
    return {
        type: ActionType.BAN_USER,
        roomId,
        username
    }
}

export function banUser(roomId: number, username: string): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()
        if (!Room.isCurrentUserAuthor(state, roomId)) {
            return null;
        }
        if (Room.isUserBanned(state, roomId, username)) {
            return null;
        }
        dispatch(performBanUser(roomId, username))
    }
}

export interface UnbanUserAction extends GenericAction {
    type: ActionType.UNBAN_USER
    roomId: number
    username: string
}
function performUnbanUser(roomId: number, username: string): UnbanUserAction {
    return {
        type: ActionType.UNBAN_USER,
        roomId,
        username
    }
}

export function unbanUser(roomId: number, username: string): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()
        if (!Room.isCurrentUserAuthor(state, roomId)) {
            return null;
        }
        if (!Room.isUserBanned(state, roomId, username)) {
            return null;
        }
        dispatch(performUnbanUser(roomId, username))
    }
}

export interface UseChatAction extends GenericAction {
    type: ActionType.USE_CHAT
}
export function didUseChat(): UseChatAction {
    // Dispatch this action whenever the client interacts with
    // the chat in some way (scrolls, focuses on text box, etc)
    // which tells analytics tracker to prolong the chat session
    return {
        type: ActionType.USE_CHAT
    }
}

/*************
 * BOOKMARKING
 *************/

type StackStatus = 'open' | 'closed'

export interface UnbookmarkAction extends GenericAction {
    type: ActionType.UNBOOKMARK
    roomId: number
    stackStatus: StackStatus
}
function performUnbookmark(roomId: number, stackStatus: StackStatus): UnbookmarkAction {
    return {
        type: ActionType.UNBOOKMARK,
        roomId,
        stackStatus
    }
}

export interface BookmarkAction extends GenericAction {
    type: ActionType.BOOKMARK
    roomId: number
    stackStatus: StackStatus
}
function performBookmark(roomId: number, stackStatus: StackStatus): BookmarkAction {
    return {
        type: ActionType.BOOKMARK,
        roomId,
        stackStatus
    }
}

export function bookmark(roomId: number): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()
        const status = Room.status(state, roomId)
        if (Room.isBookmarked(state, roomId) || Room.isCurrentUserAuthor(state, roomId)) {
            return null;
        }

        return dispatch(performBookmark(roomId, status));
    }
}

export function unbookmark(roomId: number): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()
        const status = Room.status(state, roomId)
        if (!Room.isBookmarked(state, roomId) || Room.isCurrentUserAuthor(state, roomId)) {
            return null;
        }
        
        return dispatch(performUnbookmark(roomId, status));
    }
}


/**********
 * PLAYBACK
 **********/

export interface DidPlayVideoAction extends GenericAction {
    type: ActionType.DID_PLAY_VIDEO
    roomId: number
}
export function didPlayVideo(roomId: number) {
    // Dispatch this function when user plays
    // a video in the room. Used in the room card
    // to mark when a video has already been played
    // so we can set the autoplay flag.
    return {
        type: ActionType.DID_PLAY_VIDEO,
        roomId
    }
}


/**********************
 * MEDIA ITEM SELECTION
 **********************/

export interface SelectMediaItemAction extends GenericAction {
    type: ActionType.SELECT_MEDIA_ITEM
    roomId: number
    id: number
}    
function performSelectMediaItem(roomId: number, mediaItemId: number): SelectMediaItemAction {
    return {
        type: ActionType.SELECT_MEDIA_ITEM,
        roomId,
        id: mediaItemId 
    }
}

interface SelectMediaItemOptions {
    shouldUpdateHistory?: boolean
    shouldReplaceHistory?: boolean
}
export function selectMediaItem(roomId: number, mediaItemId: number, options: SelectMediaItemOptions = {}): ThunkAction {
    
    return (dispatch, getState) => {
        
        const state = getState()
        /* If we navigate on the room page, we simply want to 
         * update the browser history here. This will trigger 
         * an update on the RoomPage component, which we can then
         * use to properly select the new media item. (TODO: why?)
         */
        options.shouldUpdateHistory = options.shouldUpdateHistory || true
        if (RoomPage.isActive(state) && options.shouldUpdateHistory) {
            /* We store the last selected media item from each stack
             * in the session in localStorage, so that it persists
             * through multiple sessions.
             */
            const hid = Room.entity(state, RoomPage.get(state, 'id')).get('hid')
            setStorageItem(hid, mediaItemId)
            var index = RoomPage.indexOfMediaItemId(state, mediaItemId)
            var url = `/r/${hid}/${index+1}`
            if (options.shouldReplaceHistory) {
                browserHistory.replace(url)
            } else {
                console.log(browserHistory, browserHistory.push)
                browserHistory.push(url)
            }
        }

        return dispatch(performSelectMediaItem(roomId, mediaItemId))
    }
}

function navigate(roomId: number, isForward: boolean): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()
        let selectedId = Room.get(state, roomId, 'selectedMediaItemId', -1)
        if (selectedId === -1) {
            return null;
        }

        let selectedIndex = Room.indexOfMediaItemId(state, roomId, selectedId)
        let numIds = Room.mediaItemsSize(state, roomId)

        if (selectedIndex == -1) {
            return null;
        }
        if (isForward && selectedIndex === numIds-1) {
            return null;
        }
        if (!isForward && selectedIndex === 0) {
            return null;
        }

        const nextIndex = isForward ? selectedIndex+1 : selectedIndex-1;
        selectedId = Room.mediaItemIdAtIndex(state, roomId, nextIndex)

        return dispatch(selectMediaItem(roomId, selectedId, { shouldReplaceHistory: true }));
    }
}

export function goForward(roomId: number) {
    return navigate(roomId, true);
}

export function goBackward(roomId: number) {
    return navigate(roomId, false);
}

export interface MarkStackAction extends ApiCallAction {
    type: ActionType.MARK_STACK
}
export function markStack(roomId: number, date: Date): MarkStackAction {
    return {
        type: ActionType.MARK_STACK,
        API_CALL: {
            method: 'PUT',
            endpoint: `stacks/${roomId}/mark`,
            queries: { ts: date.getTime().toString() },
            authenticated: true
        }
    }
}

/*******
 * RESET
 *******/

export interface ClearCommentsAction extends GenericAction {
    type: ActionType.CLEAR_COMMENTS
    roomId: number
}
export function clearComments(roomId: number): ClearCommentsAction {
    return {
        type: ActionType.CLEAR_COMMENTS,
        roomId
    }
}

export interface ClearRoomAction extends ApiCancelAction {
    type: ActionType.CLEAR_ROOM
}
export function clearRoom(roomId: number): ClearRoomAction {
    return {
        type: ActionType.CLEAR_ROOM,
        roomId,
        API_CANCEL: {
            actionTypes: [ActionType.COMMENTS, ActionType.MEDIA_ITEMS, ActionType.ROOM]
        }
    }
}

