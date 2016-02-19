import ModelBase from './base'

import { Map, List } from 'immutable'
import Stack from './stack'

const KEY_MAP = {
    // meta
    'id': ['user', 'meta', 'id'],
    'isLoggingIn': ['user', 'meta', 'isLoggingIn'],
    'error': ['user', 'meta', 'error'],
    'token': ['user', 'meta', 'token'],
    'username': ['user', 'meta', 'username'],
    'uuid': ['user', 'meta', 'uuid'],
    // live
    'connected': ['user', 'live', 'connected'],
    'client': ['user', 'live', 'client'],
    // bookmarked stacks
    'bookmarkedStackIds': ['user', 'bookmarkedStacks', 'ids']
}

export default class CurrentUser extends ModelBase {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "user";
        this.entityName = "users";
    }

    entity() {
        // todo: create user entity (involves changing passport serialization)
        return Map();
    }

    bookmarkedStacks() {
        return this.get('bookmarkedStackIds', List()).map(id => this.__getEntity(id, 'stacks'));
    }

    isLoggedIn() {
        return this.has('id');
    }

    isConnected() {
        return this.get('connected', false);
    }

    isJoiningRoom() {
        const stack = new Stack(this.state);
        return stack.get('isJoiningRoom', false);
    }

    hasJoinedRoom() {
        const stack = new Stack(this.state);
        return stack.has('room');
    }

}