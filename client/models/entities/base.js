import { Map } from 'immutable'
import { createSelector } from 'reselect'

/* Helper model for retrieving data from specific 
 * entities in the state. (Compare with the StateModel 
 * base class, which is instantiated with the root 
 * of the entire state tree.)
 */
export default class EntityModel {

    constructor(id, entities) {
        if (typeof id === "number") {
            id = id.toString()
        }

        this.id = id;
        this.entities = entities;
        this.entityName = "base";
    }

    // accessors

    get(attr, defaultValue) {
        let attrs = attr.split('.')
        return this.__entity().getIn(attrs, defaultValue)
    }

    has(attr) {
        let attrs = attr.split('.')
        return this.__entity().hasIn(attrs)
    }

    isEmpty() {
        return this.__entity().isEmpty()
    }

    entityState() {
        return this.__entity()
    }

    isEqual(entity) {
        // test immutable entity state
        return this.__entity() === entity.__entity()
    }

    // private

    __entity() {
        return this.entities.getIn([this.entityName, this.id], Map())
    }

    /* Resources (images, videos, thumbnails, etc) are represented as objects, 
     * with keys corresponding to names of different representations of that 
     * object. If the key name specified in preferredType exists, the data 
     * associated with that representation is returned. Otherwise, data 
     * associated with the key returned by the defaultKeyFn (or, if that isn't 
     * specified, a random key) is returned.
     */
    __getResource(resourceType, preferredType, defaultKeyFn) {
        let resources = this.get(resourceType, Map())
        if (preferredType && resources.has(preferredType)) {
            return resources.get(preferredType).set('type', preferredType)
        }

        // else default to any resource
        defaultKeyFn = defaultKeyFn || (resources => resources.keys().next().value) 
        let key = defaultKeyFn(resources)
        if (key) {
            return resources.get(key).set('type', key)
        }

        return Map()
    }

}