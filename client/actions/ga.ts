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
import Stack from '@models/entities/stack'
import User from '@models/entities/user'

export type GAActionAll = 
    GAIdentifyAction |
    GAPageAction |
    GAEventAction |
    LogVideoImpressionAction

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

interface LogVideoImpressionData {
    startTime: number
    endTime: number
    duration: number
    videoDuration: number
    itemId: number
    itemType: 'mediaItem' | 'ad'
    stackId: number
    authorId: number
}
export interface LogVideoImpressionAction extends AnalyticsAction {
    type: ActionType.LOG_VIDEO_IMPRESSION
}
function performLogVideoImpression({ 
    startTime, 
    endTime,
    duration,
    videoDuration,
    itemId,
    itemType, 
    stackId,
    authorId,
}: LogVideoImpressionData): LogVideoImpressionAction  {
    return {
        type: ActionType.LOG_VIDEO_IMPRESSION,
        GA: {
            type: 'event',
            category: 'video',
            action: 'track',
            label: itemType,
            [Metrics.START_TIME]: startTime,
            [Metrics.END_TIME]: endTime,
            [Metrics.DURATION]: duration,
            [Metrics.MEDIAITEM_DURATION]: videoDuration,
            [itemType === 'mediaItem' ? Dimensions.MEDIAITEM_ID : Dimensions.AD_ID]: itemId,
            [Dimensions.STACK_ID]: stackId,
            [Dimensions.AUTHOR_ID]: authorId,
        }
    }
}

export function logVideoImpression(roomId: number, itemId: number, itemType: 'mediaItem' | 'ad', startTime: number, endTime: number, videoDuration: number): ThunkAction {
    return (dispatch, getState) => {
        let stack = new Stack(roomId, getState().get('entities'))
        const logObject = {
            startTime,
            endTime,
            duration: endTime - startTime,
            videoDuration: videoDuration,
            itemId: itemId,
            itemType: itemType,
            stackId: roomId,
            authorId: stack.author().get('id')
        }

        dispatch(performLogVideoImpression(logObject))
    }
}