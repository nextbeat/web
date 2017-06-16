import { Map, List, Set } from 'immutable'

import StateModel from './base'
import Room from './room'

import StackEntity from '../entities/stack'
import UserEntity from '../entities/user'

import { memoize } from '../utils'

const KEY_MAP = {
    // meta
    'id': ['meta', 'id'],
    'token': ['meta', 'token'],
    'isLoggingIn': ['meta', 'isLoggingIn'],
    'loginError': ['meta', 'loginError'],
    'isSigningUp': ['meta', 'isSigningUp'],
    'signupError': ['meta', 'signupError'],
    'hasUpdatedEntity': ['meta', 'hasUpdatedEntity'],
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

let memoizedOpenBookmarks = memoize(
    (state) => (new CurrentUser(state)).get('openBookmarkIds', List()).map(id => new StackEntity(id, state.get('entities'))),
    (state) => (new CurrentUser(state)).get('openBookmarkIds', List()),
    (state) => (new CurrentUser(state)).get('id')
)

let memoizedSusbcriptions = memoize(
    (state) => (new CurrentUser(state)).get('subscriptionIds', List()).map(id => new UserEntity(id, state.get('entities'))),
    (state) => (new CurrentUser(state)).get('subscriptionIds', List()),
    (state) => (new CurrentUser(state)).get('id')
)

export default class CurrentUser extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['user'];
        this.entityName = "users";
    }


    // Accessors 

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
        return this.constructor.memoizedOpenBookmarks(this.state)
    }

    closedBookmarkedStacks() {
        return this.get('closedBookmarkIds', List()).map(id => new StackEntity(id, this.state.get('entities')));
    }

    subscriptions() {
        return this.constructor.memoizedSubscriptions(this.state)
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

    static memoizedOpenBookmarks(state) {
        return memoizedOpenBookmarks.get(state)
    }

    static memoizedSubscriptions(state) {
        return memoizedSusbcriptions.get(state)
    }


    // Queries

    isLoggedIn() {
        return this.has('id');
    }

    isUser(user) {
        return this.isLoggedIn() && this.get('id') === user.get('id')
    }

    isSubscribed(id) {
        return this.get('subscriptionIds', List()).includes(id);
    }

    bookmarksFetching() {
        return this.get('openBookmarksFetching') || this.get('closedBookmarksFetching')
    }

    sidebarDataIsLoaded() {
        return this.get('subscriptionsLoaded') && this.get('openBookmarksLoaded');
    }

}