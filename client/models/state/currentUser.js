import StateModel from './base'

import { Map, List, Set } from 'immutable'
import Room from './room'
import StackEntity from '../entities/stack'
import UserEntity from '../entities/user'

const KEY_MAP = {
    // meta
    'id': ['meta', 'id'],
    'isLoggingIn': ['meta', 'isLoggingIn'],
    'loginError': ['meta', 'loginError'],
    'isSigningUp': ['meta', 'isSigningUp'],
    'signupError': ['meta', 'signupError'],
    'hasUpdatedEntity': ['meta', 'hasUpdatedEntity'],
    // live
    'connected': ['live', 'connected'],
    'isConnecting': ['live', 'isConnecting'],
    'requestedDisconnect': ['live', 'requestedDisconnect'],
    'lostConnection': ['live', 'lostConnection'],
    'client': ['live', 'client'],
    // user stacks
    'stacksFetching': ['stacks', 'isFetching'],
    'openStackIds': ['stacks', 'openStackIds'],
    'closedStackIds': ['stacks', 'closedStackIds'],
    // bookmarked stacks
    'openBookmarkIds': ['bookmarks', 'open', 'ids'],
    'openBookmarksFetching': ['bookmarks', 'open', 'isFetching'],
    'openBookmarksError': ['bookmarks', 'open', 'error'],
    'closedBookmarkIds': ['bookmarks', 'closed', 'ids'],
    'closedBookmarksFetching': ['bookmarks', 'closed', 'isFetching'],
    'closedBookmarksError': ['bookmarks', 'closed', 'error'],
    'openBookmarksLoaded': ['meta', 'loadedBookmarkedStacks'],
    // subscriptions
    'subscriptionIds': ['subscriptions', 'ids'],
    'subscriptionsFetching': ['subscriptions', 'isFetching'],
    'subscriptionsError': ['subscriptions', 'error'],
    'subscriptionsLoaded': ['meta', 'loadedSubscriptions']
}

export default class CurrentUser extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['user'];
        this.entityName = "users";
    }

    entity() {
        return new UserEntity(this.get('id'), this.state.get('entities'))
    }

    profileThumbnailUrl() {
        return this.entity().thumbnail('medium').get('url')
    }

    coverImageUrl(preferredType="large") {
        return this.entity().coverImage(preferredType).get('url')
    }

    openBookmarkedStacks() {
        return this.get('openBookmarkIds', List()).map(id => new StackEntity(id, this.state.get('entities')));
    }

    closedBookmarkedStacks() {
        return this.get('closedBookmarkIds', List()).map(id => new StackEntity(id, this.state.get('entities')));
    }

    subscriptions() {
        return this.get('subscriptionIds', List()).map(id => this.__getEntity(id, 'users'));
    }

    openStacks() {
        return this.get('openStackIds', List())
            .map(id => new StackEntity(id, this.state.get('entities')))
            .filter(stack => !stack.get('deleted'))
    }

    closedStacks() {
        return this.get('closedStackIds', List())
            .map(id => new StackEntity(id, this.state.get('entities')))
            .filter(stack => !stack.get('deleted'))
    }

    // Queries

    isLoggedIn() {
        return this.has('id');
    }

    isUser(user) {
        return this.isLoggedIn() && this.get('id') === user.get('id')
    }

    isConnected() {
        return this.get('connected', false);
    }

    isSubscribed(id) {
        return this.get('subscriptionIds', List()).includes(id);
    }

    sidebarDataIsLoaded() {
        return this.get('subscriptionsLoaded') && this.get('subscriptionsLoaded');
    }

}