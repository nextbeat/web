import { List } from 'immutable'
import { EntityModel } from './base'

interface CampaignMediaItemProps {
    duration: number
    id: number
    total_watch_duration: number
    type: string
    user_count: number
}

interface CampaignStackProps {
    description: string
    hid: string
    id: number
    media_items: List<CampaignMediaItemProps>
    session_count: number
    session_duration: number
    total_watch_duration: number
    username: string
}

export default class CampaignStack extends EntityModel<CampaignStackProps> {

    entityName = "campaignStacks"

}