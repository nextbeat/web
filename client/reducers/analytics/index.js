import { Map, List, } from 'immutable'
import { ActionTypes, AnalyticsTypes } from '../../actions'

function appSessionStart(state, action) {
    let appSession = Map({
        type: 'app',
        sessionId: action.sessionId,
        startTime: action.startTime
    })

    return state
        .merge({
            userId: action.userId
        })
        .update('activeSessions', List(), sessions => sessions.push(appSession))
}

function appSessionEnd(state, action) {
    return state.update('activeSessions', List(), sessions => sessions.filterNot(session => session.get('type') === 'app'))
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.ANALYTICS) {
        if (action.eventType === AnalyticsTypes.APP_SESSION_START) {
            return appSessionStart(state, action)
        } else if (action.eventType === AnalyticsTypes.APP_SESSION_END) {
            return appSessionEnd(state, action)
        }
    }
    return state
}