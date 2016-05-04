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
    'openBookmarkIds': ['user', 'bookmarks', 'open', 'ids'],
    'openBookmarksFetching': ['user', 'bookmarks', 'open', 'isFetching'],
    'openBookmarksError': ['user', 'bookmarks', 'open', 'error'],
    'closedBookmarkIds': ['user', 'bookmarks', 'closed', 'ids'],
    'closedBookmarksFetching': ['user', 'bookmarks', 'closed', 'isFetching'],
    'closedBookmarksError': ['user', 'bookmarks', 'closed', 'error'],
    // subscriptions
    'subscriptionIds': ['user', 'subscriptions', 'ids'],
    'subscriptionsFetching': ['user', 'subscriptions', 'isFetching'],
    'subscriptionsError': ['user', 'subscriptions', 'error']
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

    profileThumbnailUrl() {
        return this.get('profpic_thumbnail_url') || this.get('profpic_url');
    }

    bookmarkedStacks() {
        return this.get('openBookmarkIds', List()).map(id => this.__getEntity(id, 'stacks'));
    }

    subscriptions() {
        return this.get('subscriptionIds', List()).map(id => this.__getEntity(id, 'users'));
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

    isSubscribed(id) {
        // if (typeof id === "number") {
        //     id = id.toString();
        // }
        return this.get('subscriptionIds', List()).includes(id);
    }

    hasUnreadNotificationsForStack(id) {
        if (typeof id === "number") {
            id = id.toString();
        }
        return this.get('unreadNotifications', Map()).get('stacks_updated', Set()).has(id);
    }

    isFetchingUserData() {
        return this.get('openBookmarksFetching') || this.get('subscriptionsFetching');
    }

}