import { List } from 'immutable'

import { EntityModel } from './base'
import { State } from '@types'

interface ShopProductProps {
    description?: string
    id: number
    price?: number
    title: string
    url: string
}

export default class ShopProduct extends EntityModel<ShopProductProps> {

    entityName = "shopProducts"

    image(preferredType?: string) {
        return this.getResource('images', preferredType)
    }

}