import { List } from 'immutable'

export function getPaginatedItems(state, key) {
    return state.getIn(['pagination', key, 'ids'], List())
        .map(id => state.getIn(['entities', key, id.toString()]));
}

export function getLiveItems(state, key) {
    return state.getIn(['live', key], List())
        .map(id => state.getIn(['entities', key, id.toString()]));
}