import StateModel from '../base'

import UserEntity from '../../entities/user'
import StackEntity from '../../entities/stack'

const KEY_MAP = {
    // meta
    'id': ['meta', 'id'],
    'isFetching': ['meta', 'isFetching'],
    'error': ['meta', 'error'],
    // pagination
    'stacksFetching': ['pagination', 'stacks', 'isFetching'],
    'stacksHasFetched': ['pagination', 'stacks', 'hasFetched'],
    'stacksError': ['pagination', 'stacks', 'error']
}

export default class Profile extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['pages', 'profile'];
        this.name = "profile";
    }

    entity() {
        return new UserEntity(this.get('id'), this.state.get('entities'))
    }

    thumbnail() {
        return this.entity().thumbnail('medium')
    }

    stacks() {
        return this.__getPaginatedEntities('stacks', { entityClass: StackEntity })
    }

}