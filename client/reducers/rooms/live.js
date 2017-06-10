import { Map, List, fromJS } from 'immutable'
import { ActionTypes, Status } from '../../actions'
import { EddyError } from '../../errors'

function processRoomInfo(state, action) {
    state = state.merge({
        pinnedCommentId: action.responseData.pinned_chat.id,
        creator: action.responseData.creator,
    })
    if ('banned_users' in action.responseData) {
        state = state.set('bannedUsers', fromJS(action.responseData.banned_users));
    }
    return state;
}

function joinRoom(state, action) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isJoining: true
            })
        case Status.SUCCESS:
            state = state.merge({
                isJoining: false,
                joined: true,
            })
            return processRoomInfo(state, action);
        case Status.FAILURE: 
            return state.merge({
                isJoining: false,
                joined: false,
                joinError: action.error.message
            }) 
    }
    return state;
}

function leaveRoom(state, action) {
    switch (action.status) {
        case Status.SUCCESS:
            return state.set('joined', false)
    } 
    return state;
}

function roomInfo(state, action) {
    if (action.status === Status.SUCCESS) {
        return processRoomInfo(state, action);
    }
    return state;
}

function sendComment(state, action) {
    if (action.status === Status.REQUESTING && action.username) {

        const comment = Map({
            type: 'message',
            subtype: 'public',
            message: action.message,
            username: action.username,
            temporary_id: action.temporaryId,
            submit_status: "submitting",
            created_at: action.createdAt
        })

        // Filter comment out of submitting and failed first,
        // in case we are resending a comment.
        return state
            .update('submittingComments', comments => comments.filter(c => c.get('temporary_id') !== action.temporaryId))
            .update('failedComments', comments => comments.filter(c => c.get('temporary_id') !== action.temporaryId))
            .update('submittingComments', subComments => subComments.push(comment))

    } else if (action.status === Status.SUCCESS) {

        return state
            .update('comments', comments => comments.push(action.responseData.comment_id))
            .update('submittingComments', comments => comments.filter(c => c.get('temporary_id') !== action.temporaryId))
            .update('failedComments', comments => comments.filter(c => c.get('temporary_id') !== action.temporaryId))

    } else if (action.status === Status.FAILURE) {

        state = state.update('submittingComments', comments => comments.filter(c => c.get('temporary_id') !== action.temporaryId))

        const comment = Map({
            type: 'message',
            message: action.message,
            username: action.username,
            temporary_id: action.temporaryId,
            submit_status: "failed",
            created_at: action.createdAt
        })
        state = state.update('failedComments', comments => comments.push(comment));

        return state

    }
    return state
}

function pinComment(state, action) {
    if (action.status === Status.SUCCESS) {
        return state.set('pinnedCommentId', action.responseData.comment_id)
    }
    return state;
}

function unpinComment(state, action) {
    if (action.status === Status.SUCCESS) {
        return state.set('pinnedCommentId', undefined)
    }
    return state;
}

function banUser(state, action) {
    if (action.status === Status.SUCCESS) {
        return state.update('bannedUsers', List(), users => users.push(action.username));
    }
    return state;
}

function unbanUser(state, action) {
    if (action.status === Status.SUCCESS) {
        return state.update('bannedUsers', List(), users => users.filterNot(u => u === action.username))
    }
    return state;
}

function clearComments(state, action) {
    return state.merge({
        comments: List(),
        submittingComments: List(),
        failedComments: List()
    })
}

function deleteMediaItem(state, action) {
    return state.update('mediaItems', mediaItems => mediaItems.filter(mId => mId !== action.id))
}

function receiveComment(state, action) {
    return state.update('comments', comments => comments.push(action.comment.id));
}

function receivePinnedComment(state, action) {
    return state.set('pinnedCommentId', action.comment.id)
}

function receiveUnpinnedComment(state, action) {
    return state.set('pinnedCommentId', undefined)
}

function receiveMediaItem(state, action) {
    return state.update('mediaItems', mediaItems => mediaItems.push(action.mediaItem.id));
}

function receiveNotificationComment(state, action) {
    return state.update('comments', comments => comments.push(action.comment.id));
}

function loadComments(state, action) {
    // When refreshing the most recent comments,
    // we need to clear out all old live comments,
    // as they will be fetched from the server.
    if (action.status === Status.REQUESTING && action.fetchType === 'mostRecent') {
        return clearComments(state, action)
    }
    return state
}

const initialState = Map({
    comments: List(),
    submittingComments: List(),
    failedComments: List(),
    mediaItems: List()
})

export default function live(state = initialState, action) {
    switch (action.type) {
        case ActionTypes.JOIN_ROOM:
            return joinRoom(state, action);
        case ActionTypes.LEAVE_ROOM:
            return leaveRoom(state, action);
        case ActionTypes.ROOM_INFO:
            return roomInfo(state, action);
        case ActionTypes.SEND_COMMENT:
            return sendComment(state, action);
        case ActionTypes.PIN_COMMENT:
            return pinComment(state, action);
        case ActionTypes.UNPIN_COMMENT:
            return unpinComment(state, action);
        case ActionTypes.BAN_USER:
            return banUser(state, action);
        case ActionTypes.UNBAN_USER:
            return unbanUser(state, action);
        case ActionTypes.CLEAR_COMMENTS:
            return clearComments(state, action);
        case ActionTypes.DELETE_MEDIA_ITEM:
            return deleteMediaItem(state, action);
        case ActionTypes.RECEIVE_COMMENT:
            return receiveComment(state, action);
        case ActionTypes.RECEIVE_PINNED_COMMENT:
            return receivePinnedComment(state, action);
        case ActionTypes.RECEIVE_UNPINNED_COMMENT:
            return receiveUnpinnedComment(state, action);
        case ActionTypes.RECEIVE_MEDIA_ITEM:
            return receiveMediaItem(state, action);
        case ActionTypes.RECEIVE_NOTIFICATION_COMMENT:
            return receiveNotificationComment(state, action);
        case ActionTypes.COMMENTS:
            return loadComments(state, action);
    }
    return state;
}