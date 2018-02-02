import { List, Set } from 'immutable'
import { StateModelFactory } from '@models/state/base'
import { withEntityMap, EntityProps } from '@models/utils'
 
import MediaItem from '@models/entities/mediaItem'
import Stack from '@models/entities/stack'
import SearchResultComment from '@models/entities/searchResultComment'
import { AdType } from '@models/entities/ad'
import ShopProduct from '@models/entities/shopProduct'
import Room, { RoomProps } from '@models/state/room'
import { createEntityListSelector } from '@models/utils'
import { State } from '@types'

export type DetailSection = 'chat' | 'activity' | 'shop'

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

    selectedDetailSection: DetailSection

    productIds: List<number>
    sponsoredProductsSponsor: string
    isSponsoredProductsExpanded: boolean
    sponsoredProductIds: List<number>
    shopFetching: boolean
    shopHasFetched: boolean
    shopError: string

    isDeleting: boolean
    hasDeleted: boolean
    deleteError: string
    isClosing: boolean
    hasClosed: boolean
    closeError: string

    isDeletingMediaItem: boolean
    deletedMediaItemId: number
    hasDeletedMediaItem: boolean
    deleteMediaItemError: string

    isEditingMediaItemTitle: boolean
    editedMediaItemId: number
    hasEditedMediaItemTitle: boolean
    editMediaItemTitleError: string
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
    // shop
    'productIds': ['shop', 'productIds'],
    'sponsoredProductsSponsor': ['shop', 'sponsor'],
    'isSponsoredProductsExpanded': ['shop', 'isSponsoredProductsExpanded'],
    'sponsoredProductIds': ['shop', 'sponsoredProductIds'],
    'shopFetching': ['shop', 'isFetching'],
    'shopHasFetched': ['shop', 'hasFetched'],
    'shopError': ['shop', 'error'],
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
    'deleteMediaItemError': ['actions', 'deleteMediaItemError'],
    'isEditingMediaItemTitle': ['actions', 'isEditingMediaItemTitle'],
    'editedMediaItemId': ['actions', 'editedMediaItemId'],
    'hasEditedMediaItemTitle': ['actions', 'hasEditedMediaItemTitle'],
    'editMediaItemTitleError': ['actions', 'editMediaItemTitleError']
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

    static isActive(state: State) {
        return !!this.get(state, 'isFetching') || this.get(state, 'id') > 0
    }

    static searchResults = createEntityListSelector(RoomPage, 'searchResultIds', SearchResultComment)

    /**
     * Wrapped properties
     */

    static entity(state: State) {
        return Room.entity(state, this.get(state, 'id'))
    }

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

    static ad(state: State, type: AdType) {
        return Room.ad(state, this.get(state, 'id'), type)
    }

    static products = createEntityListSelector(RoomPage, 'productIds', ShopProduct)
    static sponsoredProducts = createEntityListSelector(RoomPage, 'sponsoredProductIds', ShopProduct)
    
    /**
     * Wrapped queries
     */

    static isLoaded(state: State) {
        return Room.isLoaded(state, this.get(state, 'id'))
    }

    static status(state: State) {
        return Room.status(state, this.get(state, 'id'))
    }

    static shouldDisplayAds(state: State) {
        return Room.shouldDisplayAds(state, this.get(state, 'id'))
    }

    static shouldDisplayPrerollAd(state: State) {
        return Room.shouldDisplayPrerollAd(state, this.get(state, 'id'))
    }

    static shouldDisplayShop(state: State) {
        return RoomPage.entity(state).get('has_shop_tab')
    }

    static isLoadedDeep(state: State) {
        return Room.isLoadedDeep(state, this.get(state, 'id'))
            && (!this.shouldDisplayShop(state) || this.get(state, 'shopHasFetched'))
    }

    static hasErrorDeep(state: State) {
        return Room.hasErrorDeep(state, this.get(state, 'id'))
            || !!this.get(state, 'error')
            || (this.shouldDisplayShop(state) && !!this.get(state, 'shopError'))
    }

    static isFetchingDeep(state: State) {
        return !(this.isLoadedDeep(state) || this.hasErrorDeep(state))
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

    static isUserBanned(state: State, username: string) {
        return Room.isUserBanned(state, this.get(state, 'id'), username)
    }

}