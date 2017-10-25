import { EntityModel, ResourceSizeType } from './base'
import User from './user'

import { State } from '@types'

interface StackProps {
    author: number
    bookmarked: boolean
    closed: boolean
    deleted: boolean
    description: string
    hid: string
    id: number
    most_recent_post_at: string
    privacy_status: string
    unread_count: number
    uuid: string
    views: number
}

export default class Stack extends EntityModel<StackProps> {

    entityName = "stacks"

    author() {
        return new User(this.get('author', 0), this.entities)
    }

    thumbnail(preferredSize: ResourceSizeType) {
        // default to the largest thumbnail
        let defaultKeyFn = (thumbnails: State) => {
            let orderedThumbnails = thumbnails.sort((a, b) => a.get('width') > b.get('width') ? 1 : -1)
            return orderedThumbnails.keySeq().first()
        }
        return this.getResource('thumbnails', preferredSize, defaultKeyFn)
    }

}