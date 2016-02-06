import { List, Map } from 'immutable'

export function getPaginatedEntities(state, key) {
    return state.getIn(['pagination', key, 'ids'], List())
        .map(id => getEntity(state, key, id));
}

export function getLiveEntities(state, key) {
    return state.getIn(['live', key], List())
        .map(id => getEntity(state, key, id));
}

export function getEntity(state, key, id) {
    if (typeof id === "number") {
        id = id.toString();
    }
    return state.getIn(['entities', key, id], Map());
}