import StateModel from './base'
import StackEntity from '../entities/stack'

const KEY_MAP = {
    // meta
    'id': ['tag', 'meta', 'id'],
    'isFetching': ['tag', 'meta', 'isFetching'],
    'error': ['tag', 'meta', 'error'],
    // stacks
    'stacksFetching': ['tag', 'pagination', 'stacks', 'isFetching'],
    'stacksError': ['tag', 'pagination', 'stacks', 'error'],
    // filters
    'filters': ['tag', 'filters'],
    'sort': ['tag', 'filters', 'sort'],
    'status': ['tag', 'filters', 'status'],
    'time': ['tag', 'filters', 'time']
}

export default class Tag extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "tag";
        this.entityName = "tags";
    }

    stacks() {
        return this.__getPaginatedEntities('stacks').map(stack => new StackEntity(stack.get('id'), this.state.get('entities')))
    }

}