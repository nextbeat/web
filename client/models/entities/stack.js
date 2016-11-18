import EntityModel from './base'
import User from './user'

export default class Stack extends EntityModel {

    constructor(id, entities) {
        super(id, entities);
        this.entityName = "stacks";
    }

    author() {
        return new User(this.__entity().get('author', 0), this.entities)
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