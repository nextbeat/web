import assign from 'lodash-es/assign'

import { 
    ActionType, 
    GenericAction,
    ThunkAction,
    AnalyticsAction, 
    AnalyticsType, 
    AnalyticsEventType 
} from '@actions/types'
import { Metrics, Dimensions } from '../analytics/definitions' 
import User from '@models/entities/user'

export type GAActionAll = 
    GAIdentifyAction |
    GAPageAction |
    GAEventAction

/***********
 * ANALYTICS
 ***********/

export interface GAIdentifyAction extends AnalyticsAction {
    type: ActionType.GA
}
export function gaIdentify(gaid: string): GAIdentifyAction {
    return {
        type: ActionType.GA,
        GA: {
            type: 'identify',
            gaid
        }
    }
}

export interface GAPageAction extends AnalyticsAction {
    type: ActionType.GA
}
export function gaPage(): GAPageAction {
    return {
        type: ActionType.GA,
        GA: {
            type: 'page'
        }
    }
}

export interface GAEventAction extends AnalyticsAction {
    type: ActionType.GA
}
interface GAEventData {
    category: string,
    action: string,
    label?: string | number
}
export function gaEvent(data: GAEventData, callback?: () => void): GAEventAction {
    return {
        type: ActionType.GA,
        GA: {
            type: 'event',
            category: data.category,
            action: data.action,
            label: data.label,
            callback
        }
    }
}