import { Map, List } from 'immutable'
import { ActionTypes, Status } from '../../actions'

function joinRoom(state, action) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isJoining: true
            })
        case Status.SUCCESS:
            return state.merge({
                isJoining: false,
                joined: true
            })
        case Status.FAILURE: 
            return state.merge({
                isJoining: false,
                joined: false,
                joinError: action.error
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

        const comment = Map({
            type: 'message',
            message: action.message,
            username: action.username,
            temporaryId: action.temporaryId
        })
        state = state.update('failedComments', comments => comments.push(comment));

        // TODO: reimplement banning
        //
        // if (action.error === 'User is banned.') {
        //     // display chatbot error message
        //     let message = 'You have been banned from posting in this room.'
        //     const chatbotComment = Map({
        //         type: 'chatbot',
        //         message
        //     })
        //     state = state.update('comments', comments => comments.push(chatbotComment));
        // }
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

function receiveComment(state, action) {
    return state.update('comments', comments => comments.push(Map(action.comment)));
}

function receiveMediaItem(state, action) {
    const id = action.mediaItem.id;
    return state.update('mediaItems', mediaItems => mediaItems.push(id));
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
        case ActionTypes.SEND_COMMENT:
            return sendComment(state, action);
        case ActionTypes.CLEAR_COMMENTS:
            return clearComments(state, action);
        case ActionTypes.DELETE_MEDIA_ITEM:
            return deleteMediaItem(state, action);
        case ActionTypes.RECEIVE_COMMENT:
            return receiveComment(state, action);
        case ActionTypes.RECEIVE_MEDIA_ITEM:
            return receiveMediaItem(state, action);
    }
    return state;
}