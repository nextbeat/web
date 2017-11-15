import { Map } from 'immutable'
import { EntityModel } from './base'

import { State } from '@types'

interface UserProps {
    cover_image_url: string
    description: string
    full_name: string
    gaid: string
    id: number
    is_advertiser: boolean
    is_bot: boolean
    open_stacks: number
    profpic_url: string
    subscriber_count: number
    username: string
    uuid: string
    website_url: string
}

export default class User extends EntityModel<UserProps> {

    entityName = "users"

    thumbnail(preferredType: string): State {
        // default to the largest thumbnail
        let defaultKeyFn = (thumbnails: State) => {
            let orderedThumbnails = thumbnails.sort((a, b) => a.get('width') > b.get('width') ? 1 : -1 )
            return orderedThumbnails.keySeq().first()
        }
        let thumbnail = this.getResource('profpic_thumbnails', preferredType, defaultKeyFn)
        return !thumbnail.isEmpty() ? thumbnail : Map({ url: this.get('profpic_url')})
    }

    coverImage(preferredType: string): State {
        let coverImage = this.getResource('cover_images', preferredType)
        return !coverImage.isEmpty() ? coverImage : Map({ url: this.get('cover_image_url') })
    }

}