import has from 'lodash/has'
import { Map, List } from 'immutable'

// Base model class, used to access data in the state tree
// so that the organization of the state tree is abstracted
// away in other files
export default class StateModel {

    constructor(state) {
        this.state = state;
        this.keyMap = {};
        this.name = "base";
        this.entityName = "base";
    }

    get(key, defaultValue) {
        if (!has(this.keyMap, key)) {
            // if not defined in the key map, check the entity
            if (!this.entity().has(key)) {
                return defaultValue;
            } else {
                return this.entity().get(key, defaultValue);
            }
        }
        return this.state.getIn(this.keyMap[key], defaultValue);
    }

    has(key) {
        if (!has(this.keyMap, key)) {
            return this.entity().has(key);
        }
        return this.state.hasIn(this.keyMap[key]);
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

    __getPaginatedEntities(key, paginatedEntityKey, name) {
        paginatedEntityKey = paginatedEntityKey || key;
        name = name || this.name;
        return this.state.getIn([name, 'pagination', key, 'ids'], List())
            .map(id => this.__getEntity(id, paginatedEntityKey));
    }

    __getLiveEntities(key, paginatedEntityKey, name) {
        paginatedEntityKey = paginatedEntityKey || key;
        name = name || this.name;
        return this.state.getIn([name, 'live', key], List())
            .map(id => this.__getEntity(id, paginatedEntityKey));
    }

    static getEntity(state, id) {
        let model = new this(state)
        return model.__getEntity(id)
    }

}

