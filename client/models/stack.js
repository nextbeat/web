import ModelBase from './base'

import { List } from 'immutable'
import CurrentUser from './currentUser'

const KEY_MAP = {
    // meta
    'id': ['stack', 'meta', 'id'],
    'isFetching': ['stack', 'meta', 'isFetching'],
    'error': ['stack', 'meta', 'error'],
    // live
    'isJoiningRoom': ['stack', 'live', 'isJoiningRoom'],
    'room': ['stack', 'live', 'room'],
    'nickname': ['stack', 'live', 'nickname'],
    'liveComments': ['stack', 'live', 'comments'],
    // media items
    'selectedMediaItemId': ['stack', 'mediaItems', 'selected'],
    'mediaItemIds': ['stack', 'pagination', 'mediaItems', 'ids'],
    'liveMediaItemIds': ['stack', 'live', 'mediaItems'],
    // comments
    'commentsFetching': ['stack', 'pagination', 'comments', 'isFetching'],
    'commentsError': ['stack', 'pagination', 'comments', 'error']
}

export default class Stack extends ModelBase {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "stack";
        this.entityName = "stacks";
    }

    // properties

    author() {
        return this.__getEntity(this.get('author', 0), 'users')
    }

    mediaItems() {
        return this.__getPaginatedEntities('mediaItems')
    }

    selectedMediaItem() {
        return this.__getEntity(this.get('selectedMediaItemId', 0), 'mediaItems')
    }

    liveMediaItems() {
        return this.__getLiveEntities('mediaItems')
    }

    comments() {
        return this.__getPaginatedEntities('comments')
    }

    liveComments() {
        // note: live comments are stored in their entirety in stack.live.comments,
        // instead of being stored as entities, so the method for retrieving them
        // is different
        return this.get('liveComments', List())
    }

    // queries

    isBookmarked() {
        const currentUser = new CurrentUser(this.state);
        if (!currentUser.isLoggedIn()) {
            return false;
        }
        return currentUser.get('bookmarkedStackIds', List()).indexOf(this.get('id')) !== -1;
    }

    currentUserIsAuthor() {
        const currentUser = new CurrentUser(this.state);
        if (!currentUser.isLoggedIn()) {
            return false;
        }
        return this.author().get('username') === currentUser.get('username');
    }

    isLoaded() {
        return this.get('id', 0) !== 0;
    }

}