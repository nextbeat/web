import ModelBase from './base'

import { Map, List, Set } from 'immutable'
import Stack from './stack'

const KEY_MAP = {
    // meta
    'id': ['user', 'meta', 'id'],
    'isLoggingIn': ['user', 'meta', 'isLoggingIn'],
    'loginError': ['user', 'meta', 'loginError'],
    'isSigningUp': ['user', 'meta', 'isSigningUp'],
    'signupError': ['user', 'meta', 'signupError'],
    'token': ['user', 'meta', 'token'],
    'username': ['user', 'meta', 'username'],
    'uuid': ['user', 'meta', 'uuid'],
    // live
    'connected': ['user', 'live', 'connected'],
    'client': ['user', 'live', 'client'],
    // notifications
    'unreadNotifications': ['user', 'notifications', 'unread'],
    'readNotifications': ['user', 'notifications', 'read'],
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

    // Queries

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

    hasUnreadNotificationsForStack(id) {
        if (typeof id === "number") {
            id = id.toString();
        }
        return this.get('unreadNotifications', Map()).get('stacks_updated', Set()).has(id);
    }

}