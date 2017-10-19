import { Map } from 'immutable'
import { EntityModel, ResourceSizeType } from './base'

import { State } from '@types'

interface UserProps {
    username: string

    cover_image_url?: string
    profpic_url?: string
}

export default class User extends EntityModel<UserProps> {

    readonly entityName = "users"

    thumbnail(preferredType: ResourceSizeType): State {
        // default to the largest thumbnail
        let defaultKeyFn = (thumbnails: State) => {
            let orderedThumbnails = thumbnails.sort((a, b) => a.get('width') > b.get('width') ? 1 : -1 )
            return orderedThumbnails.keySeq().first()
        }
        let thumbnail = this.getResource('profpic_thumbnails', preferredType, defaultKeyFn)
        return !thumbnail.isEmpty() ? thumbnail : Map({ url: this.get('profpic_url')})
    }

    coverImage(preferredType: ResourceSizeType): State {
        let coverImage = this.getResource('cover_images', preferredType)
        return !coverImage.isEmpty() ? coverImage : Map({ url: this.get('cover_image_url') })
    }

}