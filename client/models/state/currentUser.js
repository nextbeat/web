import StateModel from './base'

import { Map, List, Set } from 'immutable'
import Stack from './stack'
import StackEntity from '../entities/stack'

const KEY_MAP = {
    // meta
    'id': ['user', 'meta', 'id'],
    'isLoggingIn': ['user', 'meta', 'isLoggingIn'],
    'loginError': ['user', 'meta', 'loginError'],
    'isSigningUp': ['user', 'meta', 'isSigningUp'],
    'signupError': ['user', 'meta', 'signupError'],
    'hasUpdatedEntity': ['user', 'meta', 'hasUpdatedEntity'],
    'isUpdatingUser': ['user', 'meta', 'isUpdatingUser'],
    'hasUpdatedUser': ['user', 'meta', 'hasUpdatedUser'],
    'updateUserError': ['user', 'meta', 'updateUserError'],
    'isUpdatingProfilePicture': ['user', 'meta', 'isUpdatingProfilePicture'], // todo: move to upload model?
    'hasUpdatedProfilePicture': ['user', 'meta', 'hasUpdatedProfilePicture'],
    'updateProfilePictureError': ['user', 'meta', 'updateProfilePictureError'],
    'updatedProfilePictureUrl': ['user', 'meta', 'updatedProfilePictureUrl'],
    // live
    'connected': ['user', 'live', 'connected'],
    'isConnecting': ['user', 'live', 'isConnecting'],
    'requestedDisconnect': ['user', 'live', 'requestedDisconnect'],
    'lostConnection': ['user', 'live', 'lostConnection'],
    'client': ['user', 'live', 'client'],
    // user stacks
    'stacksFetching': ['user', 'stacks', 'isFetching'],
    'openStackIds': ['user', 'stacks', 'openStackIds'],
    'closedStackIds': ['user', 'stacks', 'closedStackIds'],
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

export default class CurrentUser extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "user";
        this.entityName = "users";
    }

    profileThumbnailUrl() {
        return this.get('profpic_thumbnail_url') || this.get('profpic_url');
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
            .map(id => this.__getEntity(id, 'stacks'))
            .filter(stack => !stack.get('deleted'))
    }

    closedStacks() {
        return this.get('closedStackIds', List())
            .map(id => this.__getEntity(id, 'stacks'))
            .filter(stack => !stack.get('deleted'))
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
        return this.get('subscriptionIds', List()).includes(id);
    }

    isFetchingUserData() {
        return this.get('openBookmarksFetching') || this.get('subscriptionsFetching');
    }

}