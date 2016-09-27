import EntityModel from './base'

export default class Stack extends EntityModel {

    constructor(entity) {
        super(entity);
    }

    thumbnail(preferredType) {
        // default to the largest thumbnail
        let defaultKeyFn = (thumbnails) => {
            let orderedThumbnails = thumbnails.sort((a, b) => a.get('width') > b.get('width') ? 1 : -1 )
            return orderedThumbnails.keys().next().value
        }
        return this.__getResource('thumbnails', preferredType, defaultKeyFn)
    }

}