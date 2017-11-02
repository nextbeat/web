import { Map } from 'immutable'
import { createSelector } from 'reselect'
import { State } from '@types'

/* Helper model for retrieving data from specific 
 * entities in the state. (Compare with the StateModel 
 * base class, which is instantiated with the root 
 * of the entire state tree.)
 */
export class EntityModel<Props> {
    entityName: string
    
    constructor(public id: number, public entities: State) {}
 
    get<K extends keyof Props>(key: K, defaultValue?: Props[K]): Props[K] {
        return this.entity().get(key, defaultValue)
    }

    has<K extends keyof Props>(key: K) {
        return this.entity().has(key)
    }

    isEqual(entity: State): boolean {
        // test immutable entity state
        return this.entity() === entity
    }

    isEmpty(): boolean {
        return this.entity().isEmpty()
    }

    toJS() {
        return this.entity().toJS()
    }

    entity(): State {
        let idString = this.id ? this.id.toString() : '-1'
        return this.entities.getIn([this.entityName, idString], Map())
    }

    /* Resources (images, videos, thumbnails, etc) are represented as objects, 
     * with keys corresponding to names of different representations of that 
     * object. If the key name specified in preferredType exists, the data 
     * associated with that representation is returned. Otherwise, data 
     * associated with the key returned by the defaultKeyFn (or, if that isn't 
     * specified, a random key) is returned.
     */
    protected getResource(resourceType: string, preferredType?: string, defaultSizeFn?: (resources: State) => string | undefined): State {
        let resources: State = this.entity().get(resourceType, Map())
        if (preferredType && resources.has(preferredType)) {
            return resources.get(preferredType).set('type', preferredType) as State
        }

        // else default to any resource
        defaultSizeFn = defaultSizeFn || (resources => resources.keySeq().first() )
        let key = defaultSizeFn(resources)
        if (key) {
            return resources.get(key).set('type', key)
        }

        return Map()
    } 
}