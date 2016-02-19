import ModelBase from './base'

import { Map } from 'immutable'
import Stack from './stack'

const KEY_MAP = {
    // meta
    'id': ['user', 'meta', 'id'],
    'isLoggingIn': ['user', 'meta', 'isLoggingIn'],
    'token': ['user', 'meta', 'token'],
    'username': ['user', 'meta', 'username'],
    'uuid': ['user', 'meta', 'uuid'],
    // live
    'connected': ['user', 'live', 'connected'],
    'client': ['user', 'live', 'client']
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