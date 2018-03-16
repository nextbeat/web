import { List, Map, Set } from 'immutable'
import { createKeyedSelector, createSelector } from '@models/utils'

import Stack from '@models/entities/stack'
import MediaItem from '@models/entities/mediaItem'
import Comment from '@models/entities/comment'
import User from '@models/entities/user'
import Ad, { AdType } from '@models/entities/ad'
import CurrentUser from '@models/state/currentUser'
import TemporaryComment from '@models/entities/temporary/comment'
import { State } from '@types'

export type FetchDirection = 'before' | 'after' | 'around' | 'mostRecent'

export interface RoomProps {
    id: number
    isFetching: boolean
    hasFetched: boolean
    error: string

    isJoining: boolean
    joined: boolean
    timerId: number // calls room_info every X seconds

    selectedMediaItemId: number
    seenMediaItemIds: Set<number>
    mediaItemIds: List<number>
    liveMediaItemIds: List<number>
    mediaItemsFetching: boolean
    mediaItemsHasFetched: boolean
    mediaItemsError: string

    commentIds: List<number>
    commentsFetching: boolean
    commentsHasFetched: boolean
    commentsError: string
    commentsFetchType: FetchDirection
    hasReachedOldestComment: boolean
    hasReachedLatestComment: boolean
    latestCommentIds: List<number>
    liveCommentIds: List<number>
    submittingComments: List<State> 
    failedComments: List<State>
    selectedComment: number

    roomBannedUsers: List<string>
    creatorBannedUsers: List<string>
    moderators: List<string>
    pinnedCommentId: number
    creator: string
    chatTags: List<string>

    shouldSkipAds: boolean
    adIds: List<number>
    adsFetching: boolean
    adsHasFetched: boolean
    adsError: string
    hasPlayedPrerollAd: boolean

    videoDidPlay: boolean
    isAtPlaybackEnd: boolean
    isContinuousPlayEnabled: boolean
    continuousPlayCountdownTimerId: number
    continuousPlayCountdownTimeLeft: number
    continuousPlayCountdownDuration: number
}

const keyMap: {[key in keyof RoomProps]: string[]} = {
    // meta 
    'id': ['meta', 'id'],
    'isFetching': ['meta', 'isFetching'],
    'hasFetched': ['meta', 'hasFetched'],
    'error': ['meta', 'error'],
    // live
    'isJoining': ['live', 'isJoining'],
    'joined': ['live', 'joined'],
    'timerId': ['live', 'timerId'], // calls room_info every X seconds
    // media items
    'selectedMediaItemId': ['navigation', 'selected'],
    'seenMediaItemIds': ['navigation', 'seen'],
    'mediaItemIds': ['pagination', 'mediaItems', 'ids'],
    'liveMediaItemIds': ['live', 'mediaItems'],
    'mediaItemsFetching': ['pagination', 'mediaItems', 'isFetching'],
    'mediaItemsHasFetched': ['pagination', 'mediaItems', 'hasFetched'],
    'mediaItemsError': ['pagination', 'mediaItems', 'error'],
    // comments
    'commentIds': ['pagination', 'comments', 'ids'],
    'commentsFetching': ['pagination', 'comments', 'isFetching'],
    'commentsHasFetched': ['pagination', 'comments', 'hasFetched'],
    'commentsError': ['pagination', 'comments', 'error'],
    'commentsFetchType': ['pagination', 'comments', 'fetchType'],
    'hasReachedOldestComment': ['pagination', 'comments', 'hasReachedOldest'],
    'hasReachedLatestComment': ['pagination', 'comments', 'hasReachedLatest'],
    'latestCommentIds': ['pagination', 'comments', 'latestIds'],
    'liveCommentIds': ['live', 'comments'],
    'submittingComments': ['live', 'submittingComments'],
    'failedComments': ['live', 'failedComments'],
    'selectedComment': ['navigation', 'selectedComment'],
    // other data
    'roomBannedUsers': ['live', 'roomBannedUsers'],
    'creatorBannedUsers': ['live', 'creatorBannedUsers'],
    'moderators': ['live', 'moderators'],
    'pinnedCommentId': ['live', 'pinnedCommentId'],
    'creator': ['live', 'creator'],
    'chatTags': ['live', 'tags'],
    // ads
    'shouldSkipAds': ['ads', 'shouldSkip'],
    'adIds': ['ads', 'ids'],
    'adsFetching': ['ads', 'isFetching'],
    'adsHasFetched': ['ads', 'hasFetched'],
    'adsError': ['ads', 'error'],
    'hasPlayedPrerollAd': ['ads', 'hasPlayedPrerollAd'],
    // playback
    'videoDidPlay': ['navigation', 'videoDidPlay'],
    'isAtPlaybackEnd': ['navigation', 'isAtPlaybackEnd'],
    'isContinuousPlayEnabled': ['navigation', 'isContinuousPlayEnabled'],
    'continuousPlayCountdownTimerId': ['navigation', 'continuousPlayCountdownTimerId'],
    'continuousPlayCountdownTimeLeft': ['navigation', 'continuousPlayCountdownTimeLeft'],
    'continuousPlayCountdownDuration': ['navigation', 'continuousPlayCountdownDuration']
}

export default class Room {

    protected static keyPath(id: number, key: keyof RoomProps): any[] {
        return ['rooms', `${id}`].concat(keyMap[key])
    }

    static get<K extends keyof RoomProps>(state: State, id: number, key: K, defaultValue?: RoomProps[K]): RoomProps[K] {
        return state.getIn(this.keyPath(id, key), defaultValue)
    }

    static entity(state: State, id: number) {
        return new Stack(id, state.get('entities'))
    }

    /**
     * Properties   
     */

    static author = createKeyedSelector(
        (state: State, id: number) => Room.entity(state, id).author()
    )(
        (state: State, id: number) => Room.entity(state, id).author().entity(),
        (state: State, id: number) => id
    )

    static mediaItems = createKeyedSelector(
        (state: State, id: number) => {
            let mediaItemIds = Room.get(state, id, 'mediaItemIds', List());
            return mediaItemIds.map(id => new MediaItem(id, state.get('entities')))
        }
    )(
        (state: State, id: number) => Room.get(state, id, 'mediaItemIds'),
        (state: State, id: number) => id
    )

    static selectedMediaItem = createSelector(
        (state: State, id: number) => 
            new MediaItem(Room.get(state, id, 'selectedMediaItemId'), state.get('entities'))
    )(
        (state: State, id: number) => {
            let selectedId = Room.get(state, id, 'selectedMediaItemId')
            return `${id}_${selectedId}`
        }
    )

    static liveMediaItems = createKeyedSelector(
        (state: State, id: number) => {
            let liveMediaItemIds = Room.get(state, id, 'liveMediaItemIds', List());
            return liveMediaItemIds.map(id => new MediaItem(id, state.get('entities')))
        }
    )(
        (state: State, id: number) => Room.get(state, id, 'liveMediaItemIds'),
        (state: State, id: number) => id
    )

    static allMediaItems(state: State, id: number): List<MediaItem> {
        return Room.mediaItems(state, id).concat(Room.liveMediaItems(state, id)) as List<MediaItem>
    }

    static comments = createKeyedSelector(
        (state: State, id: number) => {
            let commentIds = Room.get(state, id, 'commentIds', List());
            return commentIds.map(id => new Comment(id, state.get('entities')))
        },
    )(
        (state: State, id: number) => Room.get(state, id, 'commentIds'),
        (state: State, id: number) => id
    )

    static latestComments = createKeyedSelector(
        (state: State, id: number) => {
            let commentIds = Room.get(state, id, 'latestCommentIds', List());
            return commentIds.map(id => new Comment(id, state.get('entities')))
        },
    )(
        (state: State, id: number) => Room.get(state, id, 'latestCommentIds'),
        (state: State, id: number) => id
    )

    static liveComments = createKeyedSelector(
        (state: State, id: number) => {
            let commentIds = Room.get(state, id, 'liveCommentIds', List());
            return commentIds.map(id => new Comment(id, state.get('entities')))
        },
    )(
        (state: State, id: number) => Room.get(state, id, 'liveCommentIds'),
        (state: State, id: number) => id
    )

    static submittingComments = createKeyedSelector(
        (state: State, id: number) => {
            let comments = Room.get(state, id, 'submittingComments', List())
            return comments.map(comment => new TemporaryComment(comment))
        } 
    )(
        (state: State, id: number) => Room.get(state, id, 'submittingComments'),
        (state: State, id: number) => id
    )

    static failedComments = createKeyedSelector(
        (state: State, id: number) => {
            let comments = Room.get(state, id, 'failedComments', List())
            return comments.map(comment => new TemporaryComment(comment))
        } 
    )(
        (state: State, id: number) => Room.get(state, id, 'failedComments'),
        (state: State, id: number) => id
    )

    static pinnedComment = createSelector(
        (state: State, id: number) => {
            let pinnedCommentId = Room.get(state, id, 'pinnedCommentId')
            if (!pinnedCommentId) {
                return null
            }
            return new Comment(pinnedCommentId, state.get('entities'))
        }
    )(
        (state: State, id: number) => {
            let pinnedCommentId = Room.get(state, id, 'pinnedCommentId')
            return `${id}_${pinnedCommentId}`
        }
    )

    static thumbnail(state: State, id: number, preferredSize: string): State {
        return Room.entity(state, id).thumbnail(preferredSize)
    }

    static ads = createKeyedSelector(
        (state: State, id: number) => {
            let adIds = Room.get(state, id, 'adIds', List())
            return adIds.map(id => new Ad(id, state.get('entities')))
        }
    )(
        (state: State, id: number) => Room.get(state, id, 'adIds'),
        (state: State, id: number) => id
    )

    static ad(state: State, id: number, type: AdType): Ad | null {
        return this.ads(state, id).find(ad => ad.get('type') === type) || null
    }

    static clearMediaItemsSelector(state: State, id: number) {
        Room.mediaItems.removeKey(state, id)
        Room.liveMediaItems.removeKey(state, id)
        Room.selectedMediaItem.clear()
    }

    static clearCommentsSelector(state: State, id: number) {
        Room.comments.removeKey(state, id)
        Room.liveComments.removeKey(state, id)
    }


    /**
     * Queries
     */
    
    static isLoaded(state: State, id: number): boolean {
        return (Room.get(state, id, 'id', 0) > 0)
    }

    static status(state: State, id: number) {
        return Room.entity(state, id).get('closed') ? 'closed' : 'open' 
    }

    static shouldDisplayAds(state: State, id: number) {
        return !Room.get(state, id, 'shouldSkipAds') && Room.entity(state, id).get('is_ad_supported')
    }

    static shouldDisplayPrerollAd(state: State, id: number) {
        const prerollAd = Room.ad(state, id, 'preroll')
        const hasPlayedPrerollAd = Room.get(state, id, 'hasPlayedPrerollAd')
        const item = Room.selectedMediaItem(state, id)
        return !!prerollAd && !hasPlayedPrerollAd && item.get('type') === 'video'
    }

    static isLoadedDeep(state: State, id: number): boolean {
        return Room.get(state, id, 'hasFetched') 
            && Room.get(state, id, 'mediaItemsHasFetched')
            && Room.get(state, id, 'commentsHasFetched')
            && (!Room.shouldDisplayAds(state, id) || Room.get(state, id, 'adsHasFetched'))
    }

    static hasErrorDeep(state: State, id: number): boolean {
        return !!Room.get(state, id, 'error')
            || !!Room.get(state, id, 'mediaItemsError')
            || !!Room.get(state, id, 'commentsError')
            || (Room.shouldDisplayAds(state, id) && !!Room.get(state, id, 'adsError'))
    }

    static isFetchingDeep(state: State, id: number): boolean {
        return !this.isLoadedDeep(state, id) && !this.hasErrorDeep(state, id)
    }

    /* Media Items */

    static indexOfMediaItemId(state: State, id: number, mediaItemId: number): number {
        let ids = Room.get(state, id, 'mediaItemIds', List()).concat(Room.get(state, id, 'liveMediaItemIds', List())) as List<number>
        return ids.indexOf(mediaItemId)
    }

    static mediaItemIdAtIndex(state: State, id: number, index: number): number {
        let ids = Room.get(state, id, 'mediaItemIds', List()).concat(Room.get(state, id, 'liveMediaItemIds', List())) as List<number>
        return ids.get(index) as number
    }

    static indexOfSelectedMediaItem(state: State, id: number): number {
        let selectedId = this.get(state, id, 'selectedMediaItemId')
        return this.indexOfMediaItemId(state, id, selectedId)
    }

    static mediaItemsSize(state: State, id: number): number {
        const loadedIds = this.get(state, id, 'mediaItemIds', List())
        const liveIds = this.get(state, id, 'liveMediaItemIds', List())
        return loadedIds.size + liveIds.size
    }

    static unseenLiveMediaItemsCount(state: State, id: number): number {
        const liveIds = Set(this.get(state, id, 'liveMediaItemIds', List()))
        const seenIds = this.get(state, id, 'seenMediaItemIds', Set())
        return liveIds.subtract(seenIds).size
    }

    static isUnseen(state: State, id: number, mediaItemId: number): boolean {
        return this.get(state, id, 'seenMediaItemIds', Set()).has(mediaItemId)
    }

    /* Chat */

    static hasLoadedComment(state: State, id: number, comment: Comment): boolean {
        let ids = Room.get(state, id, 'commentIds').concat(Room.get(state, id, 'liveCommentIds')) as List<number>
        return (ids.indexOf(comment.get('id')) > -1)
    }

    static mostRecentComment(state: State, id: number) {
        return this.liveComments(state, id).size > 0 ? this.liveComments(state, id).last() : this.comments(state, id).first()
    }

    static totalCommentsCount(state: State, id: number): number {
        return this.liveComments(state, id).size + this.comments(state, id).size
    }

    static isJoining(state: State, id: number): boolean {
        return !!this.get(state, id, 'isJoining', false)
    }

    static hasJoined(state: State, id: number): boolean {
        return !!this.get(state, id, 'joined', false)
    }

    static hasLoadedChat(state: State, id: number): boolean {
        return !!this.get(state, id, 'commentsHasFetched') && this.hasJoined(state, id)
    }

    static isUserRoomBanned(state: State, id: number, username: string): boolean {
        return (Room.get(state, id, 'roomBannedUsers', List()).indexOf(username) > -1)
    }

    static isUserCreatorBanned(state: State, id: number, username: string): boolean {
        return (Room.get(state, id, 'creatorBannedUsers', List()).indexOf(username) > -1)
    }

    static isUserModerator(state: State, id: number, username: string): boolean {
        return (Room.get(state, id, 'moderators', List()).indexOf(username) > -1)
    }

    /* Other */

    static isCurrentUserAuthor(state: State, id: number): boolean {
        if (!CurrentUser.isLoggedIn(state)) {
            return false
        }
        return this.author(state, id).get('username') === CurrentUser.entity(state).get('username')
    }

    static isBookmarked(state: State, id: number): boolean {
        if (!CurrentUser.isLoggedIn(state)) {
            return false
        }
        return this.entity(state, id).get('bookmarked') || CurrentUser.bookmarkedStackIds(state).indexOf(id) > -1
    }

    static loadedRoomIds(state: State): List<number> {
        let rooms = state.get('rooms', Map()) as State
        return rooms.reduce((res, _, idKey) => {
            let id = parseInt(idKey, 10)
            return Room.isLoaded(state, id) ? res.push(id) : res;
        }, List())
    }

    static idForUuid(state: State, uuid: string): number {
        let stack = state.getIn(['entities', 'stacks'], Map()).find((stack: Map<string, any>) => stack.get('uuid') === uuid)
        return !!stack ? stack.get('id') as number : -1
    }

    static idForHid(state: State, hid: string): number {
        let stack = state.getIn(['entities', 'stacks'], Map()).find((stack: Map<string, any>) => stack.get('hid') === hid)
        return !!stack ? stack.get('id') as number : -1
    }

}