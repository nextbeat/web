import { List, fromJS } from 'immutable'
import { normalize } from 'normalizr'
import { browserHistory } from 'react-router'
import format from 'date-fns/format'
import assign from 'lodash/assign'

import ActionTypes from './types'
import Schemas from '../schemas'
import { promptModal, triggerAuthError } from './app'
import { pushSubscribe } from './push'
import { loadPaginatedObjects } from './utils'
import { selectDetailSection } from './pages/room'
import { Room, RoomPage, CurrentUser, MediaItemEntity, CommentEntity } from '../models'
import { API_CALL, API_CANCEL, GA, AnalyticsTypes, GATypes } from './types'
import { setStorageItem, generateUuid } from '../utils'

const COMMENTS_PAGE_SIZE = 40;

/**********
 * FETCHING
 **********/

function fetchRoom(id) {
    return {
        type: ActionTypes.ROOM,
        roomId: id,
        [API_CALL]: {
            schema: Schemas.STACK,
            endpoint: `stacks/${id}`
        }
    }
}

export function loadRoom(id, { jumpToCommentAtDate } = {}) {
    return dispatch => {
        dispatch(fetchRoom(id))
        dispatch(loadMediaItems(id));
        dispatch(loadComments(id, 'mostRecent', { jumpTo: jumpToCommentAtDate }));
    }
}

function fetchMediaItems(roomId, pagination) {
    return {
        type: ActionTypes.MEDIA_ITEMS,
        roomId,
        [API_CALL]: {
            schema: Schemas.MEDIA_ITEMS,
            endpoint: `stacks/${roomId}/mediaitems`,
            pagination
        }
    }
}

export function loadMediaItems(roomId) {
    return loadPaginatedObjects(['rooms', roomId, 'pagination', 'mediaItems'], fetchMediaItems.bind(this, roomId), "all");
}

export function getRoomInfo(roomId) {
    return {
        type: ActionTypes.ROOM_INFO,
        roomId
    }
}


/* Comments */

function goToComment(roomId, comment) {
    return dispatch => {
        dispatch({
            type: ActionTypes.DESELECT_COMMENT,
            roomId
        })
        process.nextTick(() => {
            dispatch({
                type: ActionTypes.GO_TO_COMMENT,
                roomId,
                comment
            })
        })
    }
}

function commentClosestToDate(date, response) {
    let comments = response.entities.comments

    let comment = Object.values(comments)
        .filter(c => c.type === "message")
        .sort((a, b) => Math.abs(+(new Date(a.created_at)-date*1000)) - Math.abs(+(new Date(b.created_at)-date*1000)))[0]
    return new CommentEntity(parseInt(comment.id, 10), fromJS(response.entities))
}

function onFetchCommentSuccess(store, next, action, response) {
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
        store.dispatch(fetchComments(action.roomId, queries, { fetchType: 'around', date: action.jumpTo }))
    }
}

function fetchComments(roomId, queries, options) {
    return assign({}, options, {
        type: ActionTypes.COMMENTS,
        roomId,
        [API_CALL]: {
            schema: Schemas.COMMENTS,
            endpoint: `stacks/${roomId}/comments`,
            pagination: {
                limit: COMMENTS_PAGE_SIZE,
                page: 1
            },
            queries,
            onSuccess: onFetchCommentSuccess
        }
    })
}

export function loadComments(roomId, direction, { jumpTo } = {}) {
    return (dispatch, getState) => {
        const room = new Room(roomId, getState())
        if (direction === 'before') {
            if (room.get('hasReachedOldestComment')) {
                return null;
            }
            const queries = {
                before: room.comments().last().get('created_at')
            }
            return dispatch(fetchComments(roomId, queries, { fetchType: 'before' }));
        } else if (direction === 'after') {
            if (room.get('hasReachedLatestComment')) {
                return null;
            }
            const queries = {
                after: room.comments().first().get('created_at')
            }
            return dispatch(fetchComments(roomId, queries, { fetchType: 'after' }));
        } else if (direction === 'mostRecent') {
            const queries = {
                before: format(Date.now())
            };
            return dispatch(fetchComments(roomId, queries, { fetchType: 'mostRecent', jumpTo }));
        }
    }
}

export function jumpToComment(roomId, comment) {
    return (dispatch, getState) => {
        const room = new Room(roomId, getState())
        if (room.hasLoadedComment(comment)) {
            dispatch(goToComment(roomId, comment))
        } else {
            const queries = {
                around: (new Date(comment.get('created_at'))).getTime() / 1000
            }
            dispatch(fetchComments(roomId, queries, { fetchType: 'around', comment }))
        }
    }
}


/******
 * CHAT
 ******/

function performSendComment({ roomId, message, username, temporaryId, createdAt }) {
    return {
        type: ActionTypes.SEND_COMMENT,
        temporaryId,
        roomId,
        message,
        username,
        createdAt,
        [GA]: {
            type: GATypes.EVENT,
            category: 'chat',
            action: 'send',
            label: roomId
        }
    }
}

export function sendComment(roomId, message) {
    return (dispatch, getState) => {

        if (!message || message.trim().length === 0) {
            return null;
        }

        let currentUser = new CurrentUser(getState())

        if (!currentUser.isLoggedIn()) {
            return dispatch(triggerAuthError())
        } else {
            let username = currentUser.get('username')
            let temporaryId = generateUuid()
            let createdAt = new Date()
            let comment = { roomId, message, username, temporaryId, createdAt }
            return dispatch(performSendComment(comment));
        }
    }
}

export function resendComment(roomId, comment) {
    let newComment = {
        roomId,
        message: comment.get('message'),
        username: comment.get('username'),
        temporary_id: comment.get('temporary_id'),
        created_at: new Date()
    }
    return performSendComment(newComment)
}

function performPinComment(roomId, message) {
    return {
        type: ActionTypes.PIN_COMMENT,
        roomId,
        message
    }
}

export function pinComment(roomId, message) {
    return (dispatch, getState) => {

        if (!message || message.trim().length === 0) {
            return null;
        }

        const room = new Room(roomId, getState())
        if (!room.currentUserIsAuthor()) {
            return null;
        }
        dispatch(performPinComment(roomId, message))
    }
}

function performUnpinComment(roomId) {
    return {
        type: ActionTypes.UNPIN_COMMENT,
        roomId
    }
}

export function unpinComment(roomId) {
    return (dispatch, getState) => {
        const room = new Room(roomId, getState())
        if (!room.currentUserIsAuthor()) {
            return null;
        }
        dispatch(performUnpinComment(roomId))
    }
}

function performBanUser(roomId, username) {
    return {
        type: ActionTypes.BAN_USER,
        roomId,
        username
    }
}

export function banUser(roomId, username) {
    return (dispatch, getState) => {
        const room = new Room(roomId, getState())
        if (!room.currentUserIsAuthor()) {
            return null;
        }
        if (room.userIsBanned(username)) {
            return null;
        }
        dispatch(performBanUser(roomId, username))
    }
}

function performUnbanUser(roomId, username) {
    return {
        type: ActionTypes.UNBAN_USER,
        roomId,
        username
    }
}

export function unbanUser(roomId, username) {
    return (dispatch, getState) => {
        const room = new Room(roomId, getState())
        if (!room.currentUserIsAuthor()) {
            return null;
        }
        if (!room.userIsBanned(username)) {
            return null;
        }
        dispatch(performUnbanUser(roomId, username))
    }
}

export function didUseChat() {
    // Dispatch this action whenever the client interacts with
    // the chat in some way (scrolls, focuses on text box, etc)
    // which tells analytics tracker to prolong the chat session
    return {
        type: ActionTypes.USE_CHAT
    }
}

/*************
 * BOOKMARKING
 *************/

function performUnbookmark(roomId, stackStatus) {
    return {
        type: ActionTypes.UNBOOKMARK,
        roomId,
        stackStatus
    }
}

function performBookmark(roomId, stackStatus) {
    return {
        type: ActionTypes.BOOKMARK,
        roomId,
        stackStatus
    }
}

export function bookmark(roomId) {
    return (dispatch, getState) => {

        const room = new Room(roomId, getState())
        const status = room.status()
        if (room.isBookmarked() || room.currentUserIsAuthor()) {
            return null;
        }

        return dispatch(performBookmark(roomId, status));
    }
}

export function unbookmark(roomId) {
    return (dispatch, getState) => {

        const room = new Room(roomId, getState())
        const status = room.status()
        if (!room.isBookmarked() || room.currentUserIsAuthor()) {
            return null;
        }
        
        return dispatch(performUnbookmark(roomId, status));
    }
}


/**********
 * PLAYBACK
 **********/

export function didPlayVideo(roomId) {
    // Dispatch this function when user plays
    // a video in the room. Used in the room card
    // to mark when a video has already been played
    // so we can set the autoplay flag.
    return {
        type: ActionTypes.DID_PLAY_VIDEO,
        roomId
    }
}


/**********************
 * MEDIA ITEM SELECTION
 **********************/

function performSelectMediaItem(roomId, id) {
    return {
        type: ActionTypes.SELECT_MEDIA_ITEM,
        roomId,
        id 
    }
}

export function selectMediaItem(roomId, id, { shouldUpdateHistory = true, shouldReplaceHistory = false } = {}) {
    
    return (dispatch, getState) => {

        const roomPage = new RoomPage(getState())
        /* If we navigate on the room page, we simply want to 
         * update the browser history here. This will trigger 
         * an update on the RoomPage component, which we can then
         * use to properly select the new media item. (TODO: why?)
         */
        if (roomPage.isActive() && shouldUpdateHistory) {
            /* We store the last selected media item from each stack
             * in the session in localStorage, so that it persists
             * through multiple sessions.
             */
            setStorageItem(roomPage.get('hid'), id)
            var index = roomPage.indexOfMediaItem(id)
            var url = `/r/${roomPage.get('hid')}/${index+1}`
            if (shouldReplaceHistory) {
                browserHistory.replace(url)
            } else {
                browserHistory.push(url)
            }
        }

        return dispatch(performSelectMediaItem(roomId, id))
    }
}

function navigate(roomId, isForward) {
    return (dispatch, getState) => {
        const room = new Room(roomId, getState())
        let selectedId = room.get('selectedMediaItemId', -1)
        if (selectedId === -1) {
            return null;
        }

        const paginatedIds = room.get('mediaItemIds', List())
        const liveIds = room.get('liveMediaItemIds', List())
        const ids = paginatedIds.concat(liveIds);
        const selectedIndex = ids.indexOf(selectedId);

        if (selectedIndex == -1) {
            return null;
        }
        if (isForward && selectedIndex === ids.size-1) {
            return null;
        }
        if (!isForward && selectedIndex === 0) {
            return null;
        }

        const nextIndex = isForward ? selectedIndex+1 : selectedIndex-1;
        selectedId = ids.get(nextIndex);

        return dispatch(selectMediaItem(roomId, selectedId, { shouldReplaceHistory: true }));
    }
}

export function goForward(roomId) {
    return navigate(roomId, true);
}

export function goBackward(roomId) {
    return navigate(roomId, false);
}

function performMarkStack(roomId, date) {
    return {
        type: ActionTypes.MARK_STACK,
        [API_CALL]: {
            method: 'PUT',
            endpoint: `stacks/${roomId}/mark`,
            queries: { ts: +date },
            authenticated: true
        }
    }
}

export function markStack(roomId, date) {
    return performMarkStack(roomId, date)
}

/*******
 * RESET
 *******/

// TODO: expand into clearRoom(?), clearMediaItems, clearComments

export function clearComments(roomId) {
    return {
        type: ActionTypes.CLEAR_COMMENTS,
        roomId
    }
}

export function clearRoom(roomId) {
    return {
        type: ActionTypes.CLEAR_ROOM,
        roomId,
        [API_CANCEL]: {
            actionTypes: [ActionTypes.COMMENTS, ActionTypes.MEDIA_ITEMS, ActionTypes.ROOM]
        }
    }
}

