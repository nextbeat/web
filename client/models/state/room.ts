import { List, Map, Set } from 'immutable'
import { createKeyedSelector, createSelector } from '@models/utils'

import { ResourceSizeType } from '@models/entities/base'
import Stack from '@models/entities/stack'
import MediaItem from '@models/entities/mediaItem'
import Comment from '@models/entities/comment'
import User from '@models/entities/user'
import CurrentUser from '@models/state/currentUser'

// import TemporaryCommentEntity from '../entities/temporary/comment'

import { State } from '@types'

export type FetchDirection = 'before' | 'after' | 'around' | 'mostRecent'

export interface RoomProps {
    id: number
    isFetching: boolean
    error: string

    isJoining: boolean
    joined: boolean
    timerId: NodeJS.Timer // calls room_info every X seconds

    selectedMediaItemId: number
    seenMediaItemIds: Set<number>
    mediaItemIds: List<number>
    liveMediaItemIds: List<number>
    mediaItemsFetching: boolean
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
    submittingComments: List<any> // todo: update to temporary comment entity
    failedComments: List<any>
    selectedComment: any

    bannedUsers: List<string>
    pinnedCommentId: number
    creator: string
    chatTags: List<string>

    videoDidPlay: boolean
}

const keyMap: {[key in keyof RoomProps]: string[]} = {
    // meta 
    'id': ['meta', 'id'],
    'isFetching': ['meta', 'isFetching'],
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
    'bannedUsers': ['live', 'bannedUsers'],
    'pinnedCommentId': ['live', 'pinnedCommentId'],
    'creator': ['live', 'creator'],
    'chatTags': ['live', 'tags'],
    // playback
    'videoDidPlay': ['navigation', 'videoDidPlay']
}

export default class Room {

    protected static keyPath(id: number, key: keyof RoomProps): string[] {
        return ['rooms', id.toString()].concat(keyMap[key])
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
            let liveMediaItemIds = Room.get(state, id, 'mediaItemIds', List());
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

    static clearCommentsSelector(state: State, id: number) {
        Room.comments.removeKey(state, id)
    }

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

    // todo: submitting and failed comments

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

    static thumbnail(state: State, id: number, preferredSize: ResourceSizeType): State {
        return Room.entity(state, id).thumbnail(preferredSize)
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

    /* Media Items */

    static indexOfMediaItemId(state: State, id: number, mediaItemId: number): number {
        let ids = Room.get(state, id, 'mediaItemIds').concat(Room.get(state, id, 'liveMediaItemIds')) as List<number>
        return ids.indexOf(mediaItemId)
    }

    static mediaItemIdAtIndex(state: State, id: number, index: number): number {
        let ids = Room.get(state, id, 'mediaItemIds').concat(Room.get(state, id, 'liveMediaItemIds')) as List<number>
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

    static isFetchingDeep(state: State, id: number): boolean {
        return !this.get(state, id, 'error') && this.mediaItems(state, id).size === 0 && !this.get(state, id, 'mediaItemsError')
    }

    static isJoining(state: State, id: number): boolean {
        return !!this.get(state, id, 'isJoining', false)
    }

    static hasJoined(state: State, id: number): boolean {
        return !!this.get(state, id, 'joined', false)
    }

    static hasLoadedChat(state: State, id: number): boolean {
        return this.get(state, id, 'commentsHasFetched') && this.hasJoined(state, id)
    }

    static isUserBanned(state: State, id: number, username: string): boolean {
        return (Room.get(state, id, 'bannedUsers').indexOf(username) > -1)
    }

    /* Other */

    static isCurrentUserAuthor(state: State, id: number): boolean {
        if (!CurrentUser.isLoggedIn(state)) {
            return false
        }
        return this.author(state).get('username') === CurrentUser.entity(state).get('username')
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