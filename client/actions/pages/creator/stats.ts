import { 
    ActionType, 
    ApiCallAction, 
    ApiCancelAction,
    GenericAction,
    ThunkAction,
    ApiCall
} from '@actions/types'
import { triggerAuthError } from '@actions/app'

import CurrentUser from '@models/state/currentUser'
import * as Schemas from '@schemas'

export type StatsActionAll =
    StatsAction |
    RoomStatsAction |
    ClearStatsAction

/******
 * LOAD
 ******/

interface StatsAction extends ApiCallAction {
    type: ActionType.STATS,
    userId: number
}
function fetchStats(userId: number): StatsAction {
    return {
        type: ActionType.STATS,
        userId,
        API_CALL: {
            endpoint: `analytics/users/${userId}`,
            authenticated: true,
            schema: Schemas.StatsUser
        }
    }
}

export function loadStats(): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()

        if (!CurrentUser.isLoggedIn(state)) {
            return dispatch(triggerAuthError())
        }

        const userId = CurrentUser.get(state, 'id')
        dispatch(fetchStats(userId))
    }
}

interface RoomStatsAction extends ApiCallAction {
    type: ActionType.ROOM_STATS,
    roomHid: string
}
export function loadRoomStats(roomHid: string): RoomStatsAction {
    return {
        type: ActionType.ROOM_STATS,
        roomHid,
        API_CALL: {
            endpoint: `analytics/stacks/${roomHid}`,
            authenticated: true,
            schema: Schemas.StatsStack
        }
    }
}

/*******
 * CLEAR
 *******/

interface ClearStatsAction extends ApiCancelAction {
    type: ActionType.CLEAR_STATS
} 
export function clearStats(): ClearStatsAction {
    return {
        type: ActionType.CLEAR_STATS,
        API_CANCEL: {
            actionTypes: [ActionType.STATS, ActionType.ROOM_STATS]
        }
    }
}