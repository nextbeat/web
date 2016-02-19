import { Map, List } from 'immutable'
import * as ActionTypes from '../../actions'
import { Status } from '../../actions'

function joinRoom(state, action) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isJoiningRoom: true
            })
        case Status.SUCCESS:
            return state.merge({
                isJoiningRoom: false,
                room: action.jid,
                nickname: action.nickname
            })
        case Status.FAILURE: 
            return state.merge({
                isJoiningRoom: false
            }).delete('room').delete('nickname');
    }
    return state;
}

function leaveRoom(state, action) {
    switch (action.status) {
        case Status.SUCCESS:
            return state.delete('room').delete('nickname')
    } 
    return state;
}

function receiveComment(state, action) {
    const comment = Map({
        type: 'message',
        message: action.message,
        username: action.username
    })
    return state.update('comments', comments => comments.push(comment));
}

function receiveNotificationComment(state, action) {
    const comment = Map({
        type: 'notification',
        username: action.username,
        notification_count: action.data.count,
        notification_type: "photo",
        notification_url: action.data.url
    });
    const lastComment = state.get('comments').last();
    // we replace the most recent notification comment if it is the latest live comment
    if (lastComment 
        && lastComment.get('type') === comment.get('type') 
        && lastComment.get('notification_type') === comment.get('notification_type')) {
        return state.update('comments', comments => comments.set(-1, comment));
    } else {
        return state.update('comments', comments => comments.push(comment));
    }
}

function receiveMediaItem(state, action) {
    const id = action.id;
    return state.update('mediaItems', mediaItems => mediaItems.push(id));
}

function sendComment(state, action) {
    if (action.status !== Status.SUCCESS) {
        return state;
    }
    const comment = Map({
        type: 'message',
        message: action.message,
        username: state.get('nickname')
    })
    return state.update('comments', comments => comments.push(comment));
}

const initialState = Map({
    comments: List(),
    mediaItems: List()
})

export default function live(state = initialState, action) {
    switch (action.type) {
        case ActionTypes.JOIN_ROOM:
            return joinRoom(state, action);
        case ActionTypes.LEAVE_ROOM:
            return leaveRoom(state, action);
        case ActionTypes.RECEIVE_COMMENT:
            return receiveComment(state, action);
        case ActionTypes.RECEIVE_NOTIFICATION_COMMENT:
            return receiveNotificationComment(state, action);
        case ActionTypes.RECEIVE_MEDIA_ITEM:
            return receiveMediaItem(state, action);
        case ActionTypes.SEND_COMMENT:
            return sendComment(state, action);
    }
    return state;
}