import { List, Map } from 'immutable'

import { EntityModel } from './base'
import TemporaryEntityModel from './temporary/base'
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

export class StatsMediaItem extends TemporaryEntityModel<StatsMediaItemProps> {}

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

    mediaItems() {
        return this.get('media_items', List())
            .map(item => new StatsMediaItem(item))
    }

}