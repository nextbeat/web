import { Map, List } from 'immutable'
import * as ActionTypes from '../actions'
import { Status } from '../actions'

function xmppConnection(state, action) {
    switch (action.status) {
        case Status.REQUESTING:
            return state.merge({
                isConnecting: true
            })
        case Status.COMPLETE:
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
        case Status.COMPLETE:
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
    console.log(action);
    const comment = Map({
        message: action.message,
        username: action.username
    })
    return state.update('comments', comments => comments.push(comment));
}

const initialState = Map({
    comments: List()
})

export default function live(state = initialState, action) {
    switch (action.type) {
        case ActionTypes.XMPP_CONNECTION:
            return xmppConnection(state, action);
        case ActionTypes.JOIN_ROOM:
            return joinRoom(state, action);
        case ActionTypes.RECEIVE_COMMENT:
            return receiveComment(state, action);
    }
    return state;
}