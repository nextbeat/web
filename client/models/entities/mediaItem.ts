import { EntityModel, ResourceSizeType } from './base'
import User from './user'
import Stack from './stack'
import Comment from './comment'

import { State } from '@types'

interface MediaItemProps {
    references: number
    stack: number
    type: 'video' | 'photo'
    user_created_at: string
}

export default class MediaItem extends EntityModel<MediaItemProps> {

    entityName = "mediaItems"

    stack(): Stack {
        return new Stack(this.get('stack', 0), this.entities)
    }

    video(preferredSize?: ResourceSizeType) {
        return this.getResource('videos', preferredSize)
    }   

    image(preferredSize?: ResourceSizeType) {
        return this.getResource('images', preferredSize)
    }

    thumbnail(preferredSize?: ResourceSizeType) {
        // default to the largest thumbnail
        let defaultKeyFn = (thumbnails: State) => {
            let orderedThumbnails = thumbnails.sort((a, b) => a.get('width') > b.get('width') ? 1 : -1)
            return orderedThumbnails.keySeq().first()
        }
        return this.getResource('thumbnails', preferredSize, defaultKeyFn)
    }

    referencedComment() {
        return this.hasReference() ? new Comment(this.get('references'), this.entities) : null;
    }

    // queries
        
    hasReference() {
        return this.has('references')
    }

    isVideo() {
        return this.get('type') === 'video'
    }

    isPhoto() {
        return this.get('type') === 'photo'
    }
    
}