import { Map, List, fromJS } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import {
    RoomInfoAction,
    SendCommentAction,
    PinCommentAction,
    UnpinCommentAction,
    RoomBanAction,
    RoomUnbanAction,
    ClearCommentsAction,
    CommentsAction
} from '@actions/room'
import {
    DeleteMediaItemAction
} from '@actions/pages/room'
import {
    CreatorBanAction,
    CreatorUnbanAction,
    ModAction,
    UnmodAction
} from '@actions/user'
import {
    JoinRoomAction,
    LeaveRoomAction,
    StartRoomTimerAction,
    ReceiveCommentAction,
    ReceivePinnedCommentAction,
    ReceiveUnpinnedCommentAction,
    ReceiveMediaItemAction,
    ReceiveMediaItemDeleteAction,
    ReceiveNotificationCommentAction,
} from '@actions/eddy'
import { EddyError } from '@errors'
import { State } from '@types'

function processRoomInfo(state: State, action: RoomInfoAction | JoinRoomAction) {
    state = state.merge({
        pinnedCommentId: action.responseData.pinned_chat.id,
        creator: action.responseData.creator,
        tags: fromJS(action.responseData.tags)
    })
    if ('room_banned_users' in action.responseData) {
        state = state.set('roomBannedUsers', fromJS(action.responseData.room_banned_users));
    }
    if ('creator_banned_users' in action.responseData) {
        state = state.set('creatorBannedUsers', fromJS(action.responseData.creator_banned_users))
    }
    if ('moderators' in action.responseData) {
        state = state.set('moderators', fromJS(action.responseData.moderators))
    }
    return state;
}

function joinRoom(state: State, action: JoinRoomAction) {
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
            // Because of a bug where join room fires twice on reconnection,
            // the second join room will fail and the state tree will enter
            // a failure state, causing the chat to hang
            if (action.error.message === "already_joined") {
                return state
            } else {
                return state.merge({
                    isJoining: false,
                    joined: false,
                    joinError: action.error.message
                }) 
            }
    }
    return state;
}

function leaveRoom(state: State, action: LeaveRoomAction) {
    switch (action.status) {
        case Status.SUCCESS:
            return state.set('joined', false)
    } 
    return state;
}

function startRoomTimer(state: State, action: StartRoomTimerAction) {
    return state.set('timerId', action.timerId)
}

function roomInfo(state: State, action: RoomInfoAction) {
    if (action.status === Status.SUCCESS) {
        return processRoomInfo(state, action);
    }
    return state;
}

function sendComment(state: State, action: SendCommentAction) {
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
            .update('submittingComments', comments => comments.filter((c: State) => c.get('temporary_id') !== action.temporaryId))
            .update('failedComments', comments => comments.filter((c: State) => c.get('temporary_id') !== action.temporaryId))
            .update('submittingComments', subComments => subComments.push(comment))

    } else if (action.status === Status.SUCCESS) {

        return state
            .update('comments', comments => comments.push(action.responseData.comment_id))
            .update('submittingComments', comments => comments.filter((c: State) => c.get('temporary_id') !== action.temporaryId))
            .update('failedComments', comments => comments.filter((c: State) => c.get('temporary_id') !== action.temporaryId))

    } else if (action.status === Status.FAILURE) {

        state = state.update('submittingComments', comments => comments.filter((c: State) => c.get('temporary_id') !== action.temporaryId))

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

function pinComment(state: State, action: PinCommentAction) {
    if (action.status === Status.SUCCESS) {
        return state.set('pinnedCommentId', action.responseData.comment_id)
    }
    return state;
}

function unpinComment(state: State, action: UnpinCommentAction) {
    if (action.status === Status.SUCCESS) {
        return state.set('pinnedCommentId', undefined)
    }
    return state;
}

function roomBan(state: State, action: RoomBanAction) {
    if (action.status === Status.SUCCESS) {
        return state.update('roomBannedUsers', List(), users => users.push(action.username));
    }
    return state;
}

function roomUnban(state: State, action: RoomUnbanAction) {
    if (action.status === Status.SUCCESS) {
        return state.update('roomBannedUsers', List(), users => users.filterNot((u: any) => u === action.username))
    }
    return state;
}

function creatorBan(state: State, action: CreatorBanAction) {
    if (action.status === Status.SUCCESS) {
        return state.update('creatorBannedUsers', List(), users => users.push(action.username));
    }
    return state;
}

function creatorUnban(state: State, action: CreatorUnbanAction) {
    if (action.status === Status.SUCCESS) {
        return state.update('creatorBannedUsers', List(), users => users.filterNot((u: any) => u === action.username))
    }
    return state;
}

function mod(state: State, action: ModAction) {
    if (action.status === Status.SUCCESS) {
        return state.update('moderators', List(), users => users.push(action.username));
    }
    return state;
}

function unmod(state: State, action: UnmodAction) {
    if (action.status === Status.SUCCESS) {
        return state.update('moderators', List(), users => users.filterNot((u: any) => u === action.username))
    }
    return state;
}

function clearComments(state: State) {
    return state.merge({
        comments: List(),
        submittingComments: List(),
        failedComments: List()
    })
}

function deleteMediaItem(state: State, action: DeleteMediaItemAction) {
    return state.update('mediaItems', mediaItems => mediaItems.filter((mId: number) => mId !== action.id))
}

function receiveComment(state: State, action: ReceiveCommentAction) {
    return state.update('comments', comments => comments.push(action.comment.id));
}

function receivePinnedComment(state: State, action: ReceivePinnedCommentAction) {
    return state.set('pinnedCommentId', action.comment.id)
}

function receiveUnpinnedComment(state: State, action: ReceiveUnpinnedCommentAction) {
    return state.set('pinnedCommentId', undefined)
}

function receiveMediaItem(state: State, action: ReceiveMediaItemAction) {
    return state.update('mediaItems', (mediaItems: List<number>) => mediaItems.push(action.mediaItem.id));
}

function receiveMediaItemDelete(state: State, action: ReceiveMediaItemDeleteAction) {
    if (state.get('mediaItems').includes(action.mediaItemId)) {
        return state.update('mediaItems', (mediaItems: List<number>) => mediaItems.filter(id => id !== action.mediaItemId))
    }
    return state
}

function receiveNotificationComment(state: State, action: ReceiveNotificationCommentAction) {
    return state.update('comments', comments => comments.push(action.comment.id));
}

function loadComments(state: State, action: CommentsAction) {
    // When refreshing the most recent comments,
    // we need to clear out all old live comments,
    // as they will be fetched from the server.
    if (action.status === Status.REQUESTING && action.fetchType === 'mostRecent') {
        return clearComments(state)
    }
    return state
}

const initialState = Map({
    comments: List(),
    submittingComments: List(),
    failedComments: List(),
    mediaItems: List()
})

export default function live(state = initialState, action: Action) {
    switch (action.type) {
        case ActionType.JOIN_ROOM:
            return joinRoom(state, action);
        case ActionType.LEAVE_ROOM:
            return leaveRoom(state, action);
        case ActionType.START_ROOM_TIMER:
            return startRoomTimer(state, action);
        case ActionType.ROOM_INFO:
            return roomInfo(state, action);
        case ActionType.SEND_COMMENT:
            return sendComment(state, action);
        case ActionType.PIN_COMMENT:
            return pinComment(state, action);
        case ActionType.UNPIN_COMMENT:
            return unpinComment(state, action);
        case ActionType.ROOM_BAN:
            return roomBan(state, action);
        case ActionType.ROOM_UNBAN:
            return roomUnban(state, action);
        case ActionType.CREATOR_BAN:
            return creatorBan(state, action);
        case ActionType.CREATOR_UNBAN:
            return creatorUnban(state, action);
        case ActionType.MOD:
            return mod(state, action);
        case ActionType.UNMOD:
            return unmod(state, action);
        case ActionType.CLEAR_COMMENTS:
            return clearComments(state);
        case ActionType.DELETE_MEDIA_ITEM:
            return deleteMediaItem(state, action);
        case ActionType.RECEIVE_COMMENT:
            return receiveComment(state, action);
        case ActionType.RECEIVE_PINNED_COMMENT:
            return receivePinnedComment(state, action);
        case ActionType.RECEIVE_UNPINNED_COMMENT:
            return receiveUnpinnedComment(state, action);
        case ActionType.RECEIVE_MEDIA_ITEM:
            return receiveMediaItem(state, action);
        case ActionType.RECEIVE_MEDIA_ITEM_DELETE: 
            return receiveMediaItemDelete(state, action);
        case ActionType.RECEIVE_NOTIFICATION_COMMENT:
            return receiveNotificationComment(state, action);
        case ActionType.COMMENTS:
            return loadComments(state, action);
    }
    return state;
}