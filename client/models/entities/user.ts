import { Map, List } from 'immutable'
import { EntityModel } from './base'
import Emoji from '@models/objects/emoji'

import { State } from '@types'

interface UserSocialProps {
    platform: string
    channel_id: string
    channel_url: string
    channel_name: string
    post_id: string
}

export type UserSocial = Map<keyof UserSocialProps, string>

interface UserProps {
    cover_image_url: string
    description: string
    emojis: List<State>
    full_name: string
    gaid: string
    id: number
    open_stacks: number
    profpic_url: string
    social: List<UserSocial>
    subscriber_count: number
    username: string
    uuid: string
    website_url: string

    is_advertiser: boolean
    is_bot: boolean
    is_partner: boolean
    is_staff: boolean
    is_verified: boolean
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

    social(platform: string): UserSocial | undefined {
        return this.get('social', List()).find(social => social.get('platform') === platform)
    }

}