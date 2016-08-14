import { Map } from 'immutable'

/**
 * This model class has a different setup than the other model classes. Instead of 
 * passing the root of the state tree to instantiate it, we pass an Immutable map
 * representation of the media item itself. This class is just a helper class to 
 * retrieve image/video/thumbnail data from the media item.
 */
export default class MediaItem {

    constructor(state) {
        this.state = state
    }

    // accessors

    get(attr, defaultValue) {
        attrs = attr.split('.')
        return this.state.getIn(attrs, defaultValue)
    }

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
            return orderedThumbnails.keys().next()
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


    // private

    __getResource(resourceType, preferredType, defaultKeyFn) {
        let resources = this.get(resourceType, Map())
        if (resources.has(preferredType)) {
            return resoucres.get(preferredType).set('type', preferredType)
        }

        // else default to any resource
        defaultKeyFn = defaultKeyFn || (resources) => resources.keys().next() 
        let key = defaultKeyFn(resources)
        if (key) {
            return resources.get(key).set('type', key)
        }

        return null
    }

}