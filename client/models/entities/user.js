import { Map } from 'immutable'
import EntityModel from './base'

export default class User extends EntityModel {

    constructor(id, entities) {
        super(id, entities);
        this.entityName = "users";
    }

    thumbnail(preferredType) {
        // default to the largest thumbnail
        let defaultKeyFn = (thumbnails) => {
            let orderedThumbnails = thumbnails.sort((a, b) => a.get('width') > b.get('width') ? 1 : -1 )
            return orderedThumbnails.keys().next().value
        }
        let thumbnail = this.__getResource('profpic_thumbnails', preferredType, defaultKeyFn)
        return !thumbnail.isEmpty() ? thumbnail : Map({ url: this.get('profpic_url')})
    }

}