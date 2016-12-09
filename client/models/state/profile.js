import StateModel from './base'

import UserEntity from '../entities/user'
import StackEntity from '../entities/stack'

const KEY_MAP = {
    // meta
    'id': ['profile', 'meta', 'id'],
    'isFetching': ['profile', 'meta', 'isFetching'],
    'error': ['profile', 'meta', 'error'],
    // pagination
    'openStacksFetching': ['profile', 'pagination', 'openStacks', 'isFetching'],
    'openStacksError': ['profile', 'pagination', 'openStacks', 'error'],
    'closedStacksFetching': ['profile', 'pagination', 'closedStacks', 'isFetching'],
    'closedStacksError': ['profile', 'pagination', 'closedStacks', 'error']
}

export default class Profile extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "profile";
        this.entityName = "users";
    }

    entity() {
        return new UserEntity(this.get('id'), this.state.get('entities'))
    }

    openStacks() {
        return this.__getPaginatedEntities('openStacks', 'stacks').map(stack => new StackEntity(stack.get('id'), this.state.get('entities')))
    }

    closedStacks() {
        return this.__getPaginatedEntities('closedStacks', 'stacks').map(stack => new StackEntity(stack.get('id'), this.state.get('entities')))
    }

    // queries 

    stacksFetching() {
        return this.get('openStacksFetching') || this.get('closedStacksFetching')
    }

}