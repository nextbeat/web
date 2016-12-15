import StateModel from '../base'
import StackEntity from '../../entities/stack'
import UserEntity from '../../entities/user'

const KEY_MAP = {
    // meta
    'query': ['meta', 'query'],
    'searchType': ['meta', 'searchType'],
    // pagination
    'usersFetching': ['pagination', 'users', 'isFetching'],
    'usersError': ['pagination', 'users', 'error'],
    'tagsFetching': ['pagination', 'tags', 'isFetching'],
    'tagsError': ['pagination', 'tags', 'error'],
    'stacksFetching': ['pagination', 'stacks', 'isFetching'],
    'stacksError': ['pagination', 'stacks', 'error']
}

export default class Search extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['pages', 'search'];
    }

    tags() {
        return this.__getPaginatedEntities('tags')
    }

    users() {
        return this.__getPaginatedEntities('users', { entityClass: UserEntity })
    }

    stacks() {
        return this.__getPaginatedEntities('stacks', { entityClass: StackEntity })
    }

}