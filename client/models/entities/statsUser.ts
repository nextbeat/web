import { List } from 'immutable'

import { EntityModel } from './base'
import StatsStack from './statsStack'
import { State } from '@types'

interface StatsUserProps {
    id: number
    session_count: number
    session_duration: number
    total_watch_duration: number
    total_watch_session_duration: number
    views: number

    stacks: List<number>
}

export default class StatsUser extends EntityModel<StatsUserProps> {

    stacks(): List<StatsStack> {
        return this.get('stacks', List()).map(stackId => new StatsStack(stackId, this.entities))
    }
    
}