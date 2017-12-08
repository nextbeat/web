import { List } from 'immutable'

import { EntityModel } from './base'
import { State } from '@types'

export type AdType = 'banner' | 'preroll'

interface AdProps {
    id: number
    sponsor: string
    title: string
    type: AdType
}

export default class Ad extends EntityModel<AdProps> {

    entityName = "ads"

    video(preferredType?: string) {
        return this.getResource('videos', preferredType)
    }   

    image(preferredType?: string) {
        return this.getResource('images', preferredType)
    }

}