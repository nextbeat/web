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
    'isUpdatingUser': ['meta', 'isUpdatingUser'],
    'hasUpdatedUser': ['meta', 'hasUpdatedUser'],
    'updateUserError': ['meta', 'updateUserError'],
    'isUpdatingProfilePicture': ['meta', 'isUpdatingProfilePicture'], // todo: move to upload model?
    'hasUpdatedProfilePicture': ['meta', 'hasUpdatedProfilePicture'],
    'updateProfilePictureError': ['meta', 'updateProfilePictureError'],
    'updatedProfilePictureUrl': ['meta', 'updatedProfilePictureUrl'],
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
    // subscriptions
    'subscriptionIds': ['subscriptions', 'ids'],
    'subscriptionsFetching': ['subscriptions', 'isFetching'],
    'subscriptionsError': ['subscriptions', 'error']
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

    isJoiningRoom(id) {
        const room = new Room(id, this.state);
        return room.get('isJoiningRoom', false);
    }

    hasJoinedRoom(id) {
        const room = new Room(id, this.state);
        return room.has('room');
    }

    isSubscribed(id) {
        return this.get('subscriptionIds', List()).includes(id);
    }

    isFetchingUserData() {
        return this.get('openBookmarksFetching') || this.get('subscriptionsFetching');
    }

}