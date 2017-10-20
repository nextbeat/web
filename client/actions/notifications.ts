import { ActionType, ApiCancelAction, ApiCallAction } from './types'

export type NotificationActionAll = 
    ActivityAction |
    ClearActivityAction

/*******************
 * FETCHING ACTIVITY
 *******************/

interface ActivityAction extends ApiCallAction {
    type: ActionType.ACTIVITY
}
function fetchActivity(): ActivityAction {
    return {
        type: ActionType.ACTIVITY,
        API_CALL: {
            endpoint: "activity",
            authenticated: true
        }
    }
}

export function loadActivity(): ActivityAction {
    // todo: pagination?
    return fetchActivity();
}


/*******
 * CLEAR
 *******/

interface ClearActivityAction extends ApiCancelAction {
    type: ActionType.CLEAR_NOTIFICATIONS
}
export function clearNotifications() {
    return {
        type: ActionType.CLEAR_NOTIFICATIONS,
        API_CANCEL: {
            actionTypes: [ActionType.ACTIVITY]
        }
    }
}