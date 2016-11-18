import { Map, List, fromJS } from 'immutable'
import { ActionTypes, AnalyticsTypes } from '../../actions'

function sessionStart(state, action) {
    let session = {
        type: action.sessionType,
        attributes: action.attributes
    }

    return state
        .merge({
            userId: action.userId
        })
        .update('activeSessions', List(), sessions => sessions.push(fromJS(session)))
}

function sessionStop(state, action) {
    return state.update('activeSessions', List(), sessions => sessions.filterNot(session => session.get('type') === action.sessionType))
}

function prolongChatSession(state, action) {
    return state.set('chatTimeoutId', action.timeoutId)
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.ANALYTICS) {
        if (action.eventType === AnalyticsTypes.SESSION_START) {
            return sessionStart(state, action)
        } else if (action.eventType === AnalyticsTypes.SESSION_STOP) {
            return sessionStop(state, action)
        }
    } else if (action.type === ActionTypes.PROLONG_CHAT_SESSION) {
        return prolongChatSession(state, action)
    }
    return state
}