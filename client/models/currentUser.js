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
    'hasUpdatedEntity': ['user', 'meta', 'hasUpdatedEntity'],
    'isUpdatingUser': ['user', 'meta', 'isUpdatingUser'],
    'hasUpdatedUser': ['user', 'meta', 'hasUpdatedUser'],
    'updateUserError': ['user', 'meta', 'updateUserError'],
    // live
    'connected': ['user', 'live', 'connected'],
    'client': ['user', 'live', 'client'],
    // notifications
    'unreadNotifications': ['user', 'notifications', 'unread'],
    'readNotifications': ['user', 'notifications', 'read'],
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

export default class CurrentUser extends ModelBase {

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
        return this.get('openBookmarkIds', List()).map(id => this.__getEntity(id, 'stacks'));
    }

    closedBookmarkedStacks() {
        return this.get('closedBookmarkIds', List()).map(id => this.__getEntity(id, 'stacks'));
    }

    subscriptions() {
        return this.get('subscriptionIds', List()).map(id => this.__getEntity(id, 'users'));
    }

    openStacks() {
        return this.get('openStackIds', List()).map(id => this.__getEntity(id, 'stacks'));
    }

    closedStacks() {
        return this.get('closedStackIds', List()).map(id => this.__getEntity(id, 'stacks'));
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

    // note: next two methods only factor new_mediaitem notifications
    // we'll need to refactor when we add more notification types
    unreadNotificationCountForStack(id) {
        id = parseInt(id, 10)
        var note = this.get('unreadNotifications', Map()).get('new_mediaitem', Set()).find(note => note.get('stack') === id)
        return note ? note.get('count', 1) : 0;
    }

    totalUnreadNotificationCount(open=false) {
        let notes = this.get('unreadNotifications', Map()).get('new_mediaitem', Set())

        if (open) {
            // return only notifications for open stacks
            const openBookmarkIds = this.get('openBookmarkIds', List())
            notes = notes.filter(note => openBookmarkIds.includes(note.get('stack')))
        }
        
        return notes.reduce((total, note) => total + note.get('count', 1), 0)
        
    }

    isFetchingUserData() {
        return this.get('openBookmarksFetching') || this.get('subscriptionsFetching');
    }

    // Serialization

    readNotificationsJSON() {
        let response = {}
        const read = this.get('readNotifications', Map())
        for (var key of read.keys()) {
            let notes = []
            read.get(key).forEach(note => {
                notes.push([note.get('stack'), note.get('count', 1)])
            })
            response[key] = notes
        }
        return response
    }

}