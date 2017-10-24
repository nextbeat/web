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
import MediaItem from '@models/entities/mediaItem'
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
export function gaIdentify(userId: number): GAIdentifyAction {
    return {
        type: ActionType.GA,
        GA: {
            type: 'identify',
            userId
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
    label: string | number
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
    mediaItemId: number
    stackId: number
    authorId: number
    authorUsername: string
}
export interface LogVideoImpressionAction extends AnalyticsAction {
    type: ActionType.LOG_VIDEO_IMPRESSION
}
function performLogVideoImpression({ 
    startTime, 
    endTime,
    duration,
    videoDuration,
    mediaItemId, 
    stackId,
    authorId,
    authorUsername
}: LogVideoImpressionData): LogVideoImpressionAction  {
    return {
        type: ActionType.LOG_VIDEO_IMPRESSION,
        GA: {
            type: 'event',
            category: 'Video Impression',
            action: 'track',
            [Metrics.START_TIME]: startTime,
            [Metrics.END_TIME]: endTime,
            [Metrics.DURATION]: duration,
            [Metrics.VIDEO_DURATION]: videoDuration,
            [Dimensions.MEDIAITEM_ID]: mediaItemId,
            [Dimensions.STACK_ID]: stackId,
            [Dimensions.AUTHOR_ID]: authorId,
            [Dimensions.AUTHOR_USERNAME]: authorUsername
        }
    }
}

export function logVideoImpression(mediaItemId: number, startTime: number, endTime: number): ThunkAction {
    return (dispatch, getState) => {
        let mediaItem = new MediaItem(mediaItemId, getState().get('entities'))
        let stack = mediaItem.stack()
        let author = stack.author()

        dispatch(performLogVideoImpression({
            startTime,
            endTime,
            duration: endTime - startTime,
            videoDuration: mediaItem.video().get('duration'),
            mediaItemId: mediaItemId,
            stackId: stack.get('id'),
            authorId: author.get('id'),
            authorUsername: author.get('username')
        }))
    }
}