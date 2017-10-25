import { List, Set } from 'immutable'
import { StateModelFactory } from '@models/state/base'
import { withEntityMap, EntityProps } from '@models/utils'
 
import MediaItem from '@models/entities/mediaItem'
import Stack from '@models/entities/stack'
import SearchResultComment from '@models/entities/searchResultComment'
import Room, { RoomProps } from '@models/state/room'
import { createEntityListSelector } from '@models/utils'
import { State } from '@types'

interface RoomPageProps extends EntityProps {
    unreadCount: number
    lastRead: Date

    selectedChatUsername: string
    mentions: List<string>
    showSearchResults: boolean
    searchQuery: string
    searchResultIds: List<number>
    searchResultsFetching: boolean
    searchResultsHasFetched: boolean
    searchResultsError: string
    searchSuggestionsFetching: boolean
    searchSuggestionsHasFetched: boolean
    searchSuggestions: List<string>
    searchHistory: List<string>

    selectedDetailSection: 'chat' | 'activity'

    moreStackIds: List<number>

    isDeleting: boolean
    hasDeleted: boolean
    deleteError: string
    isClosing: boolean
    hasClosed: boolean
    closeError: string
    isDeletingMediaItem: boolean
    deletedMediaItemId: number
    hasDeletedMediaItem: number
    deleteMediaItemError: string
}

const keyMap = withEntityMap({
    // unread
    'unreadCount': ['unread', 'count'],
    'lastRead': ['unread', 'lastRead'],
    // chat
    'selectedChatUsername': ['chat', 'selectedUsername'],
    'mentions': ['chat', 'mentions'],
    'showSearchResults': ['chat', 'showSearchResults'],
    'searchQuery': ['chat', 'searchQuery'],
    'searchResultIds': ['chat', 'search', 'ids'],
    'searchResultsFetching': ['chat', 'search', 'isFetching'],
    'searchResultsHasFetched': ['chat', 'search', 'hasFetched'],
    'searchResultsError': ['chat', 'search', 'error'],
    'searchSuggestionsFetching': ['chat', 'searchSuggestions', 'isFetching'],
    'searchSuggestionsHasFetched': ['chat', 'searchSuggestions', 'hasFetched'],
    'searchSuggestions': ['chat', 'searchSuggestions', 'terms'],
    'searchHistory': ['chat', 'searchHistory'],
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
    'closeError': ['actions', 'closeError'],
    'isDeletingMediaItem': ['actions', 'isDeletingMediaItem'],
    'deletedMediaItemId': ['actions', 'deletedMediaItemId'],
    'hasDeletedMediaItem': ['actions', 'hasDeletedMediaItem'],
    'deleteMediaItemError': ['actions', 'deleteMediaItemError']
})

const keyMapPrefix = ['pages', 'room']

/**
 * This class is a wrapper around the Room model
 * when the user has loaded a room in its own
 * page, and thus has extra methods regarding the
 * functionality not available in a room card.
 */
export default class RoomPage extends StateModelFactory<RoomPageProps>(keyMap, keyMapPrefix) {

    static readonly NUM_SEARCH_SUGGESTIONS = 4

    static get<K extends keyof RoomPageProps>(state: State, key: K, defaultValue?: RoomPageProps[K]): RoomPageProps[K] {
            let value = super.get(state, key)
            if (typeof value === 'undefined') {
                value = Room.get(state, this.get(state, 'id'), key as keyof RoomProps, defaultValue)
            }
            return value
        }

    static isActive(state: State) {
        return !!this.get(state, 'isFetching') || this.get(state, 'id') > 0
    }

    static moreStacks = createEntityListSelector(RoomPage, 'moreStackIds', Stack)

    static searchResults = createEntityListSelector(RoomPage, 'searchResultIds', SearchResultComment)

    /**
     * Wrapped properties
     */

    static author(state: State) {
        return Room.author(state, this.get(state, 'id'))
    }

    static mediaItems(state: State) {
        return Room.mediaItems(state, this.get(state, 'id'))
    }

    static selectedMediaItem(state: State) {
        return Room.selectedMediaItem(state, this.get(state, 'id'))
    }

    static liveMediaItems(state: State) {
        return Room.liveMediaItems(state, this.get(state, 'id'))
    }

    static allMediaItems(state: State) {
        return Room.allMediaItems(state, this.get(state, 'id'))
    }

    static comments(state: State) {
        return Room.comments(state, this.get(state, 'id'))
    }

    static liveComments(state: State) {
        return Room.liveComments(state, this.get(state, 'id'))
    }

    static pinnedComment(state: State) {
        return Room.pinnedComment(state, this.get(state, 'id'))
    }

    static thumbnail(state: State, preferredType: string) {
        return Room.thumbnail(state, this.get(state, 'id'), preferredType)
    }
    
    /**
     * Wrapped queries
     */

    static isLoaded(state: State) {
        return Room.isLoaded(state, this.get(state, 'id'))
    }

    static status(state: State) {
        return Room.status(state, this.get(state, 'id'))
    }

    static isBookmarked(state: State) {
        return Room.isBookmarked(state, this.get(state, 'id'))
    }

    static isCurrentUserAuthor(state: State) {
        return Room.isCurrentUserAuthor(state, this.get(state, 'id'))
    }

    static indexOfSelectedMediaItem(state: State) {
        return Room.indexOfSelectedMediaItem(state, this.get(state, 'id'))
    }

    static indexOfMediaItemId(state: State, id: number) {
        return Room.indexOfMediaItemId(state, this.get(state, 'id'), id)
    }

    static mediaItemsSize(state: State) {
        return Room.mediaItemsSize(state, this.get(state, 'id'))
    }

    static unseenLiveMediaItemsCount(state: State) {
        return Room.unseenLiveMediaItemsCount(state, this.get(state, 'id'))
    }

    static isUnseen(state: State, id: number) {
        return Room.isUnseen(state, this.get(state, 'id'), id)
    }

    static mostRecentComment(state: State) {
        return Room.mostRecentComment(state, this.get(state, 'id'))
    }

    static isFetchingDeep(state: State) {
        return Room.isFetchingDeep(state, this.get(state, 'id'))
    }

    static isUserBanned(state: State, username: string) {
        return Room.isUserBanned(state, this.get(state, 'id'), username)
    }

}