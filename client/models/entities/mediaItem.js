import EntityModel from './base'

import Stack from './stack'
import Comment from './comment'

export default class MediaItem extends EntityModel {

    constructor(id, entities) {
        super(id, entities);
        this.entityName = "mediaItems"
    }

    // accessors

    video(preferredType) {
        return this.__getResource('videos', preferredType)
    }   

    image(preferredType) {
        return this.__getResource('images', preferredType)
    }

    thumbnail(preferredType) {
        // default to the largest thumbnail
        let defaultKeyFn = (thumbnails) => {
            let orderedThumbnails = thumbnails.sort((a, b) => a.get('width') > b.get('width') ? 1 : -1 )
            return orderedThumbnails.keys().next().value
        }
        return this.__getResource('thumbnails', preferredType, defaultKeyFn)
    }

    stack() {
        return new Stack(this.__entity().get('stack_id', 0), this.entities)
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