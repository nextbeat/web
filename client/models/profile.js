import ModelBase from './base'

const KEY_MAP = {
    // meta
    'id': ['profile', 'meta', 'id'],
    'isFetching': ['profile', 'meta', 'isFetching'],
    'error': ['profile', 'meta', 'error']
}

export default class Profile extends ModelBase {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "profile";
        this.entityName = "users";
    }

    openStacks() {
        return this.__getPaginatedEntities('openStacks', 'stacks')
    }

    closedStacks() {
        return this.__getPaginatedEntities('closedStacks', 'stacks')
    }

}