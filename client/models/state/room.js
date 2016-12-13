import { List, Map } from 'immutable'

import StateModel from './base'
import CurrentUser from './currentUser'

import StackEntity from '../entities/stack'
import MediaItemEntity from '../entities/mediaItem'
import CommentEntity from '../entities/comment'

const KEY_MAP = {
    // meta 
    'id': ['meta', 'id'],
    'isFetching': ['meta', 'isFetching'],
    'error': ['meta', 'error'],
    // live
    'isJoiningRoom': ['live', 'isJoiningRoom'],
    'room': ['live', 'room'],
    'nickname': ['live', 'nickname'],
    // media items
    'selectedMediaItemId': ['navigation', 'selected'],
    'seenMediaItemIds': ['navigation', 'seen'],
    'mediaItemIds': ['pagination', 'mediaItems', 'ids'],
    'liveMediaItemIds': ['live', 'mediaItems'],
    'mediaItemsFetching': ['pagination', 'mediaItems', 'isFetching'],
    'mediaItemError': ['pagination', 'mediaItems', 'error'],
    // comments
    'commentsFetching': ['pagination', 'comments', 'isFetching'],
    'commentsError': ['pagination', 'comments', 'error'],
    'liveComments': ['live', 'comments']
}

export default class Room extends StateModel {

    constructor(id, state) {
        super(state);

        this.id = id;
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['rooms', this.id];
    }

    entity() {
        return new StackEntity(this.id, this.state.get('entities'))
    }

    /**
     * Properties
     */

    author() {
        return this.entity().author()
    }

    mediaItems() {
        return this.__getPaginatedEntities('mediaItems', { entityClass: MediaItemEntity })
    }

    selectedMediaItem() {
        return new MediaItemEntity(this.get('selectedMediaItemId', 0), this.state.get('entities'))
    }

    liveMediaItems() {
        return this.get('liveMediaItemIds').map(id => new MediaItemEntity(id, this.state.get('entities')))
    }

    comments() {
        return this.__getPaginatedEntities('comments', { entityClass: CommentEntity })
    }

    liveComments() {
        // note: live comments are stored in their entirety in stack.live.comments,
        // instead of being stored as entities, so the method for retrieving them
        // is different
        return this.get('liveComments', List())
    }

    thumbnail(preferredType) {
        return this.entity().thumbnail(preferredType)
    }

    /**
     * Queries
     */

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

    isFetchingDeep() {
        // returns true if fetching the stack OR its media items
        return !this.get('error') && this.mediaItems().size === 0 && !this.get('mediaItemsError')
    }


}