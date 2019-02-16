import { List, Map } from 'immutable'

import { EntityModel } from './base'
import ObjectModel from '../objects/base'
import { State } from '@types'

interface StatsMediaItemProps {
    id: number
    type: 'photo' | 'video'
    title?: string
    references?: string

    user_count: number
    session_count: number
    total_watch_duration: number
    video_duration: number
}

export class StatsMediaItem extends ObjectModel<StatsMediaItemProps> {}

interface StatsStackProps {
    id: number
    hid: string
    description: string
    created_at: string

    session_count: number
    session_duration: number
    total_watch_duration: number
    total_watch_session_count: number
    high_activity_session_count: number
    high_activity_session_duration: number
    views: number

    media_items: List<Map<string, any>>
}

export default class StatsStack extends EntityModel<StatsStackProps> {

    entityName = "statsStacks"

    thumbnail(preferredType: string) {
        // default to the largest thumbnail
        let defaultKeyFn = (thumbnails: State) => {
            let orderedThumbnails = thumbnails.sort((a, b) => a.get('width') > b.get('width') ? 1 : -1)
            return orderedThumbnails.keySeq().first()
        }
        return this.getResource('thumbnails', preferredType, defaultKeyFn)
    }

    mediaItems() {
        return this.get('media_items', List())
            .map(item => new StatsMediaItem(item))
    }

}