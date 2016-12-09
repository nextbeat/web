import StateModel from './base'
import MediaItemEntity from '../entities/mediaItem'
import StackEntity from '../entities/stack'

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
    'bannedUserIds': ['stack', 'chat', 'bannedUserIds'],
    'selectedChatUsername': ['stack', 'chat', 'selectedUsername'],
    'chatMessage': ['stack', 'chat', 'message'],
    // ui
    'selectedDetailSection': ['stack', 'ui', 'detailSection'],
    // more
    'moreStackIds': ['stack', 'more', 'ids'],
    // actions
    'isDeleting': ['stack', 'actions', 'isDeleting'],
    'hasDeleted': ['stack', 'actions', 'hasDeleted'],
    'deleteError': ['stack', 'actions', 'deleteError'],
    'isClosing': ['stack', 'actions', 'isClosing'],
    'hasClosed': ['stack', 'actions', 'hasClosed'],
    'closeError': ['stack', 'actions', 'closeError']
}

export default class Stack extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "stack";
        this.entityName = "stacks";
    }

    entity() {
        return new StackEntity(this.get('id'), this.state.get('entities'))
    }


    // properties

    author() {
        return this.__getEntity(this.get('author', 0), 'users')
    }

    mediaItems() {
        return this.__getPaginatedEntities('mediaItems').map(m => new MediaItemEntity(m.get('id'), this.state.get('entities')))
    }

    selectedMediaItem() {
        return new MediaItemEntity(this.get('selectedMediaItemId', 0), this.state.get('entities'))
    }

    liveMediaItems() {
        return this.__getLiveEntities('mediaItems').map(m => new MediaItemEntity(m.get('id'), this.state.get('entities')))
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
        return this.get('moreStackIds', List()).map(id => new StackEntity(id, this.state.get('entities')))
    }

    thumbnail(preferredType) {
        return this.entity().thumbnail(preferredType)
    }

    bannedUsers() {
        return this.get('bannedUserIds', List()).map(id => this.__getEntity(id, 'users'))
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

    isFetchingDeep() {
        // returns true if fetching the stack OR its media items
        return !this.get('error') && this.mediaItems().size === 0 && !this.get('mediaItemsError')
    }

    userIsBanned(username) {
        // note that this takes username as param, NOT user id
        return this.bannedUsers().filter(u => u.get('username') === username).size > 0
    }

}