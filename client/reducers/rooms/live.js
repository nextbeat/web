import { Map, List } from 'immutable'
import { ActionTypes, Status } from '../../actions'

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
        notification_type: action.data.type,
        username: action.username,
        notification_count: action.data.count,
        notification_url: action.data.url,
        mediaitem_id: action.data.id
    });
    const lastComment = state.get('comments').last();
    // we replace the most recent notification comment if it is the latest live comment
    if (lastComment && lastComment.get('type') === 'notification' && lastComment.get('notification_type') === 'mediaitem' && action.data.type === 'mediaitem') {
        return state.update('comments', comments => comments.set(-1, comment));
    } else {
        return state.update('comments', comments => comments.push(comment));
    }
}

function receiveChatbotComment(state, action) {
    const comment = Map({
        type: 'chatbot',
        message: action.message,
        subtype: action.subtype
    })
    return state.update('comments', comments => comments.push(comment));
}

function receiveMediaItem(state, action) {
    const id = action.id;
    return state.update('mediaItems', mediaItems => mediaItems.push(id));
}

function sendComment(state, action) {
    if (action.status === Status.REQUESTING && action.username) {

        const comment = Map({
            type: 'message',
            message: action.message,
            username: action.username,
            temporaryId: action.temporaryId
        })
        return state.update('submittingComments', subComments => subComments.push(comment))

    } else if (action.status === Status.SUCCESS) {

        const comment = Map({
            type: 'message',
            message: action.message,
            username: action.username
        })
        return state
            .update('comments', comments => comments.push(comment))
            .update('submittingComments', comments => comments.filter(c => c.get('temporaryId') !== action.temporaryId))
            .update('failedComments', comments => comments.filter(c => c.get('temporaryId') !== action.temporaryId))

    } else if (action.status === Status.FAILURE && action.error !== 'User is not logged in.') {

        state = state.update('submittingComments', comments => comments.filter(c => c.get('temporaryId') !== action.temporaryId))

        if (action.error === 'User is banned.') {
            // display chatbot error message
            let message = 'You have been banned from posting in this room.'
            const chatbotComment = Map({
                type: 'chatbot',
                message
            })
            state = state.update('comments', comments => comments.push(chatbotComment));
        } else {
            const comment = Map({
                type: 'message',
                message: action.message,
                username: action.username,
                temporaryId: action.temporaryId
            })
            state = state.update('failedComments', comments => comments.push(comment));
        }
        return state

    }
    return state
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

const initialState = Map({
    comments: List(),
    submittingComments: List(),
    failedComments: List(),
    mediaItems: List()
})

export default function live(state = initialState, action) {
    switch (action.type) {
        case ActionTypes.JOIN_XMPP_ROOM:
            return joinRoom(state, action);
        case ActionTypes.LEAVE_XMPP_ROOM:
            return leaveRoom(state, action);
        case ActionTypes.RECEIVE_COMMENT:
            return receiveComment(state, action);
        case ActionTypes.RECEIVE_NOTIFICATION_COMMENT:
            return receiveNotificationComment(state, action);
        case ActionTypes.RECEIVE_CHATBOT_COMMENT:
            return receiveChatbotComment(state, action)
        case ActionTypes.RECEIVE_MEDIA_ITEM:
            return receiveMediaItem(state, action);
        case ActionTypes.SEND_COMMENT:
            return sendComment(state, action);
        case ActionTypes.CLEAR_COMMENTS:
            return clearComments(state, action);
        case ActionTypes.DELETE_MEDIA_ITEM:
            return deleteMediaItem(state, action);
    }
    return state;
}