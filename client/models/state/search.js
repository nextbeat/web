import StateModel from './base'

const KEY_MAP = {
    // meta
    'query': ['search', 'meta', 'query'],
    'searchType': ['search', 'meta', 'searchType'],
    // pagination
    'usersFetching': ['search', 'pagination', 'users', 'isFetching'],
    'usersError': ['search', 'pagination', 'users', 'error'],
    'tagsFetching': ['search', 'pagination', 'tags', 'isFetching'],
    'tagsError': ['search', 'pagination', 'tags', 'error'],
    'stacksFetching': ['search', 'pagination', 'stacks', 'isFetching'],
    'stacksError': ['search', 'pagination', 'stacks', 'error']
}

export default class Search extends StateModel {

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

    stacks() {
        return this.__getPaginatedEntities('stacks')
    }

}