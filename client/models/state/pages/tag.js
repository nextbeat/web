import StateModel from '../base'
import StackEntity from '../../entities/stack'

const KEY_MAP = {
    // meta
    'id': ['meta', 'id'],
    'isFetching': ['meta', 'isFetching'],
    'error': ['meta', 'error'],
    // stacks
    'stacksFetching': ['pagination', 'stacks', 'isFetching'],
    'stacksError': ['pagination', 'stacks', 'error'],
    // filters
    'filters': ['filters'],
    'sort': ['filters', 'sort'],
    'status': ['filters', 'status'],
    'time': ['filters', 'time']
}

export default class Tag extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['pages', 'tag'];
        this.entityName = "tags";
    }

    stacks() {
        return this.__getPaginatedEntities('stacks', { entityClass: StackEntity }))
    }

}