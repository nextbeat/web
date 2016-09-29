import { Map } from 'immutable'
import { normalize } from 'normalizr'

import ActionTypes from './types'
import Schemas from '../schemas'
import { Stack } from '../models'

export function connectToXMPP() {
    return {
        type: ActionTypes.CONNECT_XMPP
    }
}

export function disconnectXMPP() {
    return {
        type: ActionTypes.DISCONNECT_XMPP
    }
}

export function lostXMPPConnection() {
    return {
        type: ActionTypes.LOST_XMPP_CONNECTION
    }
}

export function reconnectXMPP() {
    return {
        type: ActionTypes.RECONNECT_XMPP
    }
}

export function joinRoom() {
    return {
        type: ActionTypes.JOIN_ROOM
    }
}

export function leaveRoom() {
    return {
        type: ActionTypes.LEAVE_ROOM
    }
}

export function receiveComment(message, username) {
    return {
        type: ActionTypes.RECEIVE_COMMENT,
        message,
        username
    }
}

export function receiveNotificationComment(data, username) {
    return (dispatch, getState) => {
        const stack = new Stack(getState())
        const mostRecentComment = stack.comments().first() || Map()
        if (mostRecentComment.get('type') === 'notification' && mostRecentComment.get('notification_type') === 'mediaitem') {
            // update the most recent notification item instead of posting a new one
            const newComment = {
                id: mostRecentComment.get('id'),
                notification_count: data.count
            }
            return dispatch({
                type: ActionTypes.ENTITY_UPDATE,
                response: normalize(newComment, Schemas.COMMENT)
            })
        } else {
            // post as new notification comment in live section
            return dispatch({
                type: ActionTypes.RECEIVE_NOTIFICATION_COMMENT,
                data,
                username
            })
        }

    }
    
}   

export function receiveMediaItem(id, response) {
    return {
        type: ActionTypes.RECEIVE_MEDIA_ITEM,
        id,
        response
    }
}

export function receiveStackClosed() {
    return {
        type: ActionTypes.RECEIVE_STACK_CLOSED
    }
}