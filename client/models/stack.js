import ModelBase from './base'
import MediaItem from './mediaItem'

import { List, Set } from 'immutable'
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
    'seenMediaItemIds': ['stack', 'mediaItems', 'seen'],
    'mediaItemIds': ['stack', 'pagination', 'mediaItems', 'ids'],
    'liveMediaItemIds': ['stack', 'live', 'mediaItems'],
    'mediaItemsFetching': ['stack', 'pagination', 'mediaItems', 'isFetching'],
    'mediaItemError': ['stack', 'pagination', 'mediaItems', 'error'],
    // comments
    'commentsFetching': ['stack', 'pagination', 'comments', 'isFetching'],
    'commentsError': ['stack', 'pagination', 'comments', 'error'],
    // ui
    'selectedDetailSection': ['stack', 'ui', 'detailSection'],
    // more
    'moreStackIds': ['stack', 'more', 'ids']
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
        return this.__getPaginatedEntities('mediaItems').map(state => MediaItem(state))
    }

    selectedMediaItem() {
        let mediaItemState = this.__getEntity(this.get('selectedMediaItemId', 0), 'mediaItems')
        return MediaItem(mediaItemState)
    }

    liveMediaItems() {
        return this.__getLiveEntities('mediaItems').map(state => MediaItem(state))
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

    moreStacks() {
        return this.get('moreStackIds', List()).map(id => this.__getEntity(id, 'stacks'))
    }

    // queries

    status() {
        return this.get('closed') ? "closed" : "open"
    }

    isBookmarked() {
        const currentUser = new CurrentUser(this.state);
        if (!currentUser.isLoggedIn()) {
            return false;
        }
        const bookmarkIds = currentUser.get('openBookmarkIds', List()).concat(currentUser.get('closedBookmarkIds', List()))
        return this.get('bookmarked') || bookmarkIds.indexOf(this.get('id')) !== -1;
    }

    currentUserIsAuthor() {
        const currentUser = new CurrentUser(this.state);
        if (!currentUser.isLoggedIn()) {
            return false;
        }
        return this.author().get('username') === currentUser.get('username');
    }

    indexOfSelectedMediaItem() {
        const selectedId = this.get('selectedMediaItemId', -1)
        return this.indexOfMediaItem(selectedId)
    }

    indexOfMediaItem(id) {
        const paginatedIds = this.get('mediaItemIds', List())
        const liveIds = this.get('liveMediaItemIds', List())
        const ids = paginatedIds.concat(liveIds)
        return ids.indexOf(id)
    }

    mediaItemsSize() {
        const paginatedIds = this.get('mediaItemIds', List())
        const liveIds = this.get('liveMediaItemIds', List())
        return paginatedIds.size + liveIds.size
    }

    unseenLiveMediaItemsCount() {
        const liveIds = Set(this.get('liveMediaItemIds', List()))
        const seenIds = this.get('seenMediaItemIds', Set())
        return liveIds.subtract(seenIds).count()
    }

    isUnseen(id) {
        return !this.get('seenMediaItemIds', Set()).has(id)
    }

    mostRecentComment() {
        return this.liveComments().size > 0 ? this.liveComments().last() : this.comments().first()
    }

    // returns true if fetching the stack OR its media items
    isFetchingDeep() {
        return !this.get('error') && this.mediaItems().size === 0 && !this.get('mediaItemsError')
    }

}