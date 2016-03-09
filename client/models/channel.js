import ModelBase from './base'

const KEY_MAP = {
    // meta
    'id': ['channel', 'meta', 'id'],
    'isFetching': ['channel', 'meta', 'isFetching'],
    'error': ['channel', 'meta', 'error'],
    // stacks
    'stacksFetching': ['channel', 'pagination', 'stacks', 'isFetching'],
    'stacksError': ['channel', 'pagination', 'stacks', 'error'],
    // filters
    'sort': ['channel', 'filters', 'sort'],
    'status': ['channel', 'filters', 'status']
}

export default class Profile extends ModelBase {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "channel";
        this.entityName = "channels";
    }

    stacks() {
        return this.__getPaginatedEntities('stacks')
    }

}