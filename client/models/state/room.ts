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

interface RoomProps {
    id: number
    isFetching: boolean
    error: string

    isJoining: boolean
    joined: boolean
    timerId: number // calls room_info every X seconds

    selectedMediaItemId: number
    seenMediaItemIds: List<number>
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
    
    static status(state: State, id: number) {
        return Room.entity(state, id).get('closed') ? 'closed' : 'open' 
    }

    static indexOfMediaItemId(state: State, id: number, mediaItemId: number): number {
        let ids = Room.get(state, id, 'mediaItemIds').concat(Room.get(state, id, 'liveMediaItemIds')) as List<number>
        return ids.indexOf(mediaItemId)
    }

    static mediaItemIdAtIndex(state: State, id: number, index: number): number {
        let ids = Room.get(state, id, 'mediaItemIds').concat(Room.get(state, id, 'liveMediaItemIds')) as List<number>
        return ids.get(index) as number
    }

    static hasLoadedComment(state: State, id: number, comment: Comment): boolean {
        let ids = Room.get(state, id, 'commentIds').concat(Room.get(state, id, 'liveCommentIds')) as List<number>
        return (ids.indexOf(comment.get('id')) > -1)
    }

    static isUserBanned(state: State, id: number, username: string): boolean {
        return (Room.get(state, id, 'bannedUsers').indexOf(username) > -1)
    }

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

    // TODO
}



//     indexOfSelectedMediaItem() {
//         const selectedId = this.get('selectedMediaItemId', -1)
//         return this.indexOfMediaItem(selectedId)
//     }

//     indexOfMediaItem(id) {
//         const paginatedIds = this.get('mediaItemIds', List())
//         const liveIds = this.get('liveMediaItemIds', List())
//         const ids = paginatedIds.concat(liveIds)
//         return ids.indexOf(id)
//     }

//     mediaItemsSize() {
//         const paginatedIds = this.get('mediaItemIds', List())
//         const liveIds = this.get('liveMediaItemIds', List())
//         return paginatedIds.size + liveIds.size
//     }

//     unseenLiveMediaItemsCount() {
//         const liveIds = Set(this.get('liveMediaItemIds', List()))
//         const seenIds = this.get('seenMediaItemIds', Set())
//         return liveIds.subtract(seenIds).count()
//     }

//     isUnseen(id) {
//         return !this.get('seenMediaItemIds', Set()).has(id)
//     }

//     mostRecentComment() {
//         return this.liveComments().size > 0 ? this.liveComments().last() : this.comments().first()
//     }

//     totalCommentsCount() {
//         return this.liveComments().size + this.comments().size
//     }

//     isFetchingDeep() {
//         // returns true if fetching the stack OR its media items
//         return !this.get('error') && this.mediaItems().size === 0 && !this.get('mediaItemsError')
//     }

//     isJoining() {
//         return !!this.get('isJoining', false)
//     }

//     hasJoined() {
//         return !!this.get('joined', false)
//     }

//     hasLoadedComment(comment) {
//         return this.get('commentIds', List()).concat(this.get('liveCommentIds', List())).indexOf(comment.get('id')) > -1
//     }

//     hasLoadedChat() {
//         return this.get('commentsHasFetched') && this.hasJoined()
//     }

//     userIsBanned(username) {
//         // note that this takes username as param, NOT user id
//         return this.get('bannedUsers', List()).indexOf(username) > -1
//     }

//     static loadedRooms(state) {
//         let rooms = state.get('rooms')
//         return rooms.reduce((res, _, id) => {
//             let room = new Room(id, state)
//             return room.isLoaded() ? res.push(room) : res;
//         }, List())
//     }

//     static roomWithUuid(uuid, state) {
//         let stack = state.getIn(['entities', 'stacks'], Map()).find(stack => stack.get('uuid') === uuid)
//         return !!stack ? new Room(stack.get('id'), state) : null
//     }

//     static roomWithHid(hid, state) {
//         let stack = state.getIn(['entities', 'stacks'], Map()).find(stack => stack.get('hid') === hid)
//         return !!stack ? new Room(stack.get('id'), state) : null
//     }
// }