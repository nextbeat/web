import has from 'lodash/has'
import { Map, List } from 'immutable'
import { createSelector } from 'reselect'

/**
 * Base model class, used to access data in the state tree
 * so that the organization of the state tree is abstracted
 * away in other files.
 */
export default class StateModel {

    constructor(state) {
        this.state = state;
        this.keyMap = {};
        this.keyMapPrefix = [];
        this.entityName = "base";
    }

    keyPath(key) {
        if (!has(this.keyMap, key)) {
            return null
        }
        let path = this.keyMap[key]
        if (this.keyMapPrefix.length > 0) {
            path = this.keyMapPrefix.concat(path)
        }
        return path
    }

    get(key, defaultValue) {
        if (!this.keyPath(key)) {
            // if not defined in the key map, check the entity
            if (!this.entity().has(key)) {
                return defaultValue;
            } else {
                return this.entity().get(key, defaultValue);
            }
        }
        // console.log(this.keyPath(key))
        return this.state.getIn(this.keyPath(key), defaultValue);
    }

    has(key) {
        if (!this.keyPath(key)) {
            return this.entity().has(key);
        }
        return this.state.hasIn(this.keyPath(key));
    }

    entity() {
        return has(this.keyMap, 'id') ? this.__getEntity(this.get('id')) : Map();
    }

    isLoaded() {
        return this.get('id', 0) !== 0;
    }

    __getEntity(id, entityName) {
        entityName = entityName || this.entityName;
        if (typeof id === "number") {
            id = id.toString();
        }
        return this.state.getIn(['entities', entityName, id], Map());
    }

    __getPaginatedEntities(key, { paginatedEntityKey, entityClass } = {}) {
        let keyPath = this.keyMapPrefix.concat(['pagination', key, 'ids'])
        return this.state.getIn(keyPath, List())
            .map(id => {
                if (entityClass) {
                    // Same as calling new <entityClass>()
                    let entity = Object.create(entityClass.prototype);
                    entityClass.call(entity, id, this.state.get('entities'))
                    return entity
                } else {
                    paginatedEntityKey = paginatedEntityKey || key;
                    return this.__getEntity(id, paginatedEntityKey)
                }
            });
    }

    static getEntity(state, id) {
        let model = new this(state)
        return model.__getEntity(id)
    }
}

