import { Map, List } from 'immutable'
import * as ActionTypes from '../actions'
import { Status } from '../actions'
import moment from 'moment'

function xmppConnection(state, action) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isConnecting: true
            })
        case Status.SUCCESS:
            return state.merge({
                isConnecting: false,
                connected: true,
                client: action.client
            })
        case Status.FAILURE:
            return state.merge({
                isConnecting: false,
                connected: false
            })
    }
    return state;
}

function joinRoom(state, action) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isJoiningRoom: true
            })
        case Status.SUCCESS:
            return state.merge({
                isJoiningRoom: false,
                joinedRoom: true
            })
        case Status.FAILURE: 
            return state.merge({
                isJoiningRoom: false,
                joinedRoom: false
            })
    }
    return this.state;
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

const initialState = Map({
    comments: List(),
    mediaItems: List()
})

export default function live(state = initialState, action) {
    switch (action.type) {
        case ActionTypes.XMPP_CONNECTION:
            return xmppConnection(state, action);
        case ActionTypes.JOIN_ROOM:
            return joinRoom(state, action);
        case ActionTypes.RECEIVE_COMMENT:
            return receiveComment(state, action);
        case ActionTypes.RECEIVE_NOTIFICATION_COMMENT:
            return receiveNotificationComment(state, action);
        case ActionTypes.RECEIVE_MEDIA_ITEM:
            return receiveMediaItem(state, action);
    }
    return state;
}