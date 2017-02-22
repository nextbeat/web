import assign from 'lodash/assign'

import ActionTypes from './types'
import { GA, GATypes } from './types'
import { Metrics, Dimensions } from '../analytics/definitions' 
import { MediaItemEntity } from '../models'

/***********
 * ANALYTICS
 ***********/

export function gaIdentify(user) {
    return {
        type: ActionTypes.GA,
        [GA]: {
            type: GATypes.IDENTIFY,
            user
        }
    }
}

export function gaPage() {
    return {
        type: ActionTypes.GA,
        [GA]: {
            type: GATypes.PAGE
        }
    }
}

export function gaEvent(data, cb, timeout=1000) {
    return {
        type: ActionTypes.GA,
        [GA]: assign({}, data, {
            type: GATypes.EVENT,
            callback: cb,
            timeout
        })
    }
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
}) 
{
    return {
        type: ActionTypes.LOG_VIDEO_IMPRESSION,
        [GA]: {
            type: GATypes.EVENT,
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

export function logVideoImpression(id, startTime, endTime) {
    return (dispatch, getState) => {
        let mediaItem = new MediaItemEntity(id, getState().get('entities'))
        let stack = mediaItem.stack()
        let author = stack.author()

        dispatch(performLogVideoImpression({
            startTime,
            endTime,
            duration: endTime - startTime,
            videoDuration: mediaItem.video().get('duration'),
            mediaItemId: id,
            stackId: stack.get('id'),
            authorId: author.get('id'),
            authorUsername: author.get('username')
        }))
    }
}