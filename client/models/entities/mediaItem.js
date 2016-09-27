import EntityModel from './base'

export default class MediaItem extends EntityModel {

    constructor(entity) {
        super(entity);
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


    // queries

    isVideo() {
        return this.get('type') === 'video'
    }

    isPhoto() {
        return this.get('type') === 'photo'
    }

}