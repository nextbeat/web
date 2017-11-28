import { List, Map } from 'immutable'
import { EntityModel } from './base'

export interface CampaignMediaItemProps {
    duration: number
    id: number
    total_watch_duration: number
    type: string
    user_count: number
}

interface CampaignStackProps {
    description: string
    hid: string
    high_activity_session_count: number
    high_activity_session_duration: number
    id: number
    media_items: List<Map<keyof CampaignMediaItemProps, any>>
    session_count: number
    session_duration: number
    total_watch_duration: number
    username: string
}

export default class CampaignStack extends EntityModel<CampaignStackProps> {

    entityName = "campaignStacks"

}