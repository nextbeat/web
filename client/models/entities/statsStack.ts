import { List } from 'immutable'

import { EntityModel } from './base'
import { State } from '@types'

interface StatsMediaItemProps {
    id: number
    type: 'photo' | 'video'

    user_count: number
    total_watch_duration: number
    video_duration: number
}

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

    mediaItems: List<Map<keyof StatsMediaItemProps, any>>
}

export default class StatsStack extends EntityModel<StatsStackProps> {}