import { List, Set } from 'immutable'
import StateModel from '../base'

import MediaItemEntity from '../../entities/mediaItem'
import StackEntity from '../../entities/room'

import Room from '../room'

const KEY_MAP = {
    // meta
    'id': ['meta', 'id'],
    'isFetching': ['meta', 'isFetching'],
    'error': ['meta', 'error'],
    // chat
    'bannedUserIds': ['chat', 'bannedUserIds'],
    'selectedChatUsername': ['chat', 'selectedUsername'],
    'chatMessage': ['chat', 'message'],
    // ui
    'selectedDetailSection': ['ui', 'detailSection'],
    // more
    'moreStackIds': ['more', 'ids'],
    // actions
    'isDeleting': ['actions', 'isDeleting'],
    'hasDeleted': ['actions', 'hasDeleted'],
    'deleteError': ['actions', 'deleteError'],
    'isClosing': ['actions', 'isClosing'],
    'hasClosed': ['actions', 'hasClosed'],
    'closeError': ['actions', 'closeError']
}

/**
 * This class is a wrapper around the Room model
 * when the user has loaded a room in its own
 * page, and thus has extra methods regarding the
 * functionality not available in a room card.
 */
export default class RoomPage extends StateModel {

    constructor(state) {
        super(state);

        this.keyMap = KEY_MAP;
        this.name = "stack";
        this.entityName = "stacks";
    }

    entity() {
        return new StackEntity(this.get('id'), this.state.get('entities'))
    }

    room() {
        return new Room(this.get('id'), this.state)
    }

    get(key) {
        let value = super.get(key)
        // try Room model if unsuccessful
        if (!value) {
            value = this.room().get(key)
        }
        return value
    } 


    // Properties

    author() {
        return this.room().author()
    }

    mediaItems() {
        return this.room().mediaItems()
    }

    selectedMediaItem() {
        return this.room().selectedMediaItem()
    }

    liveMediaItems() {
        return this.room().liveMediaItems()
    }

    comments() {
        return this.room().comments()
    }

    liveComments() {
        return this.room().liveComments()
    }

    thumbnail(preferredType) {
        return this.room().thumbnail(preferredType)
    }

    moreStacks() {
        return this.get('moreStackIds', List()).map(id => new StackEntity(id, this.state.get('entities')))
    }

    bannedUsers() {
        return this.get('bannedUserIds', List()).map(id => this.__getEntity(id, 'users'))
    }


    // Queries

    status() {
        return this.room().status()
    }

    isBookmarked() {
        return this.room().isBookmarked()
    }

    currentUserIsAuthor() {
        return this.room().currentUserIsAuthor()
    }

    indexOfSelectedMediaItem() {
        return this.room().indexOfSelectedMediaItem()
    }

    indexOfMediaItem(id) {
        return this.room().indexOfMediaItem(id)
    }

    mediaItemsSize() {
        return this.room().mediaItemsSize()
    }

    unseenLiveMediaItemsCount() {
        return this.room().unseenLiveMediaItemsCount()
    }

    isUnseen(id) {
        return this.room().isUnseen(id)
    }

    mostRecentComment() {
        return this.room().mostRecentComment()
    }

    isFetchingDeep() {
        return this.room().isFetchingDeep()
    }

    userIsBanned(username) {
        // note that this takes username as param, NOT user id
        return this.bannedUsers().filter(u => u.get('username') === username).size > 0
    }

}