import { List } from 'immutable'

import { EntityModel } from './base'
import User from './user'
import { State } from '@types'

interface StackProps {
    author: number
    bookmarked: boolean
    bookmark_count: number
    closed: boolean
    created_at: string
    deleted: boolean
    description: string
    expires: string
    has_shop_tab: boolean
    hid: string
    id: number
    is_ad_supported: boolean
    mediaitem_count: number
    most_recent_post_at: string
    privacy_status: string
    tags: List<string>
    unread_count: number
    uuid: string
    views: number
}

export default class Stack extends EntityModel<StackProps> {

    entityName = "stacks"

    author() {
        return new User(this.get('author', 0), this.entities)
    }

    thumbnail(preferredType: string) {
        // default to the largest thumbnail
        let defaultKeyFn = (thumbnails: State) => {
            let orderedThumbnails = thumbnails.sort((a, b) => a.get('width') > b.get('width') ? 1 : -1)
            return orderedThumbnails.keySeq().first()
        }
        return this.getResource('thumbnails', preferredType, defaultKeyFn)
    }

}