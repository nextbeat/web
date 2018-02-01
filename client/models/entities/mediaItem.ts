import { EntityModel } from './base'
import User from './user'
import Stack from './stack'
import Comment from './comment'

import { State } from '@types'

interface MediaItemProps {
    id: number
    references: number
    stack_id: number
    title: string
    type: 'video' | 'photo'
    user_created_at: string
}

export default class MediaItem extends EntityModel<MediaItemProps> {

    entityName = "mediaItems"

    stack(): Stack {
        return new Stack(this.get('stack_id', 0), this.entities)
    }

    video(preferredType?: string) {
        return this.getResource('videos', preferredType)
    }   

    image(preferredType?: string) {
        return this.getResource('images', preferredType)
    }

    thumbnail(preferredType?: string) {
        // default to the largest thumbnail
        let defaultKeyFn = (thumbnails: State) => {
            let orderedThumbnails = thumbnails.sort((a, b) => a.get('width') > b.get('width') ? 1 : -1)
            return orderedThumbnails.keySeq().first()
        }
        return this.getResource('thumbnails', preferredType, defaultKeyFn)
    }

    referencedComment() {
        return this.hasReference() ? new Comment(this.get('references'), this.entities) : null;
    }

    // queries
        
    hasReference() {
        return this.has('references')
    }

    hasTitle() {
        return !!this.get('title') && this.get('title').length > 0
    }

    hasAnnotation() {
        return this.hasReference() || this.hasTitle()
    }

    isVideo() {
        return this.get('type') === 'video'
    }

    isPhoto() {
        return this.get('type') === 'photo'
    }
    
}