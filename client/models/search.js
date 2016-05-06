import ModelBase from './base'

const KEY_MAP = {
    // meta
    'query': ['search', 'meta', 'query'],
    'searchType': ['search', 'meta', 'searchType']
    // pagination
    // TODO
}

export default class Search extends ModelBase {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "search";
    }

    tags() {
        return this.__getPaginatedEntities('tags')
    }

    users() {
        return this.__getPaginatedEntities('users')
    }

}