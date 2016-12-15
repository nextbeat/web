import StateModel from '../base'

import UserEntity from '../../entities/user'
import StackEntity from '../../entities/stack'

const KEY_MAP = {
    // meta
    'id': ['meta', 'id'],
    'isFetching': ['meta', 'isFetching'],
    'error': ['meta', 'error'],
    // pagination
    'openStacksFetching': ['pagination', 'openStacks', 'isFetching'],
    'openStacksError': ['pagination', 'openStacks', 'error'],
    'closedStacksFetching': ['pagination', 'closedStacks', 'isFetching'],
    'closedStacksError': ['pagination', 'closedStacks', 'error']
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

    openStacks() {
        return this.__getPaginatedEntities('openStacks', { entityClass: StackEntity })
    }

    closedStacks() {
        return this.__getPaginatedEntities('closedStacks', { entityClass: StackEntity })
    }

    // queries 

    stacksFetching() {
        return this.get('openStacksFetching') || this.get('closedStacksFetching')
    }

}