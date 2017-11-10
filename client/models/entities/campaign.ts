import { List } from 'immutable'

import { EntityModel } from './base'
import { State } from '@types'

interface CampaignProps {
    end_date: string
    id: number
    goal: number
    name: string 
    start_date: string
}

export default class Campaign extends EntityModel<CampaignProps> {

    entityName = "campaigns"

}