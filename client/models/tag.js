import ModelBase from './base'

const KEY_MAP = {
    // meta
    'id': ['tag', 'meta', 'id'],
    'isFetching': ['tag', 'meta', 'isFetching'],
    'error': ['tag', 'meta', 'error'],
    // stacks
    'stacksFetching': ['tag', 'pagination', 'stacks', 'isFetching'],
    'stacksError': ['tag', 'pagination', 'stacks', 'error'],
    // filters
    'sort': ['tag', 'filters', 'sort'],
    'status': ['tag', 'filters', 'status']
}

export default class Tag extends ModelBase {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "tag";
        this.entityName = "tags";
    }

    stacks() {
        return this.__getPaginatedEntities('stacks')
    }

}