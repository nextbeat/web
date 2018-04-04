import { Map, List, Set } from 'immutable'

import { State } from '@types'
import { createSelector, createEntityListSelector } from '@models/utils'
import { StateModelFactory } from '@models/state/base'
import UserEntity from '@models/entities/user'
import StackEntity from '@models/entities/stack'

interface SocialProps {
    isRevoking: boolean
    hasRevoked: boolean
    revokeError: string
}

interface CurrentUserProps {
    id: number
    token: string
    cookie: string
    isLoggingIn: boolean
    loginError: string
    isSigningUp: boolean
    signupError: string
    hasUpdatedEntity: boolean

    stacksFetching: boolean
    openStackIds: List<number>
    closedStackIds: List<number>

    openBookmarkIds: List<number>
    openBookmarksFetching: boolean
    openBookmarksError: string
    closedBookmarkIds: List<number>
    closedBookmarksFetching: boolean
    closedBookmarksError: string
    openBookmarksLoaded: boolean

    subscriptionIds: List<number>
    subscriptionsFetching: boolean
    subscriptionsError: string
    subscriptionsLoaded: boolean

    social: Map<string, any>
}

const keyMap = {
    // meta
    'id': ['meta', 'id'],
    'token': ['meta', 'token'],
    'cookie': ['meta', 'cookie'],
    'isLoggingIn': ['meta', 'isLoggingIn'],
    'loginError': ['meta', 'loginError'],
    'isSigningUp': ['meta', 'isSigningUp'],
    'signupError': ['meta', 'signupError'],
    'hasUpdatedEntity': ['meta', 'hasUpdatedEntity'],
    // user stacks
    'stacksFetching': ['stacks', 'isFetching'],
    'openStackIds': ['stacks', 'openStackIds'],
    'closedStackIds': ['stacks', 'closedStackIds'],
    // bookmarked stacks
    'openBookmarkIds': ['bookmarks', 'open', 'ids'],
    'openBookmarksFetching': ['bookmarks', 'open', 'isFetching'],
    'openBookmarksError': ['bookmarks', 'open', 'error'],
    'closedBookmarkIds': ['bookmarks', 'closed', 'ids'],
    'closedBookmarksFetching': ['bookmarks', 'closed', 'isFetching'],
    'closedBookmarksError': ['bookmarks', 'closed', 'error'],
    'openBookmarksLoaded': ['meta', 'loadedBookmarkedStacks'],
    // subscriptions
    'subscriptionIds': ['subscriptions', 'ids'],
    'subscriptionsFetching': ['subscriptions', 'isFetching'],
    'subscriptionsError': ['subscriptions', 'error'],
    'subscriptionsLoaded': ['meta', 'loadedSubscriptions'],
    // social
    'social': ['social']
}

const keyMapPrefix = ['user']

export default class CurrentUser extends StateModelFactory<CurrentUserProps>(keyMap, keyMapPrefix) {
    static readonly entityName = 'users'

    static entity(state: State) {
        return new UserEntity(this.get(state, 'id'), state.get('entities'))
    }

    /**
     * Properties
     */

    static profileThumbnailUrl(state: State): string {
        return this.entity(state).thumbnail('medium').get('url') as string
    }

    static coverImageUrl(state: State, preferredType?: string): string {
        preferredType = preferredType || 'large'
        return this.entity(state).coverImage(preferredType).get('url') as string
    }

    static bookmarkedStackIds(state: State): List<number> {
        return CurrentUser.get(state, 'openBookmarkIds', List()).concat(CurrentUser.get(state, 'closedBookmarkIds', List())) as List<number>
    }

    static openBookmarkedStacks = createEntityListSelector(CurrentUser, 'openBookmarkIds', StackEntity)

    static closedBookmarkedStacks = createEntityListSelector(CurrentUser, 'closedBookmarkIds', StackEntity)

    static subscriptions = createEntityListSelector(CurrentUser, 'subscriptionIds', UserEntity)

    static openStacks = createSelector(
        (state: State) => CurrentUser.get(state, 'openStackIds', List())
            .map(id => new StackEntity(id, state.get('entities')))
            .filter(stack => !stack.get('deleted'))
    )(
        (state: State) => CurrentUser.get(state, 'openStackIds')
    )

    static closedStacks = createSelector(
        (state: State) => CurrentUser.get(state, 'closedStackIds', List())
            .map(id => new StackEntity(id, state.get('entities')))
            .filter(stack => !stack.get('deleted'))
    )(
        (state: State) => CurrentUser.get(state, 'closedStackIds')
    )

    static social<K extends keyof SocialProps>(state: State, platform: string, key: K): SocialProps[K] {
        return this.get(state, 'social', Map()).get(platform, Map()).get(key)
    }

    /**
     * Queries
     */
    
    static isLoggedIn(state: State) {
        return this.has(state, 'id')
    }

    static isUser(state: State, user: UserEntity) {
        return this.isLoggedIn(state) && this.get(state, 'id') === user.get('id')
    }

    static isPartner(state: State) {
        return !!this.isLoggedIn(state) && this.entity(state).get('is_advertiser')
    }

    static isSubscribed(state: State, userId: number) {
        return this.get(state, 'subscriptionIds', List()).includes(userId)
    }

    static isBookmarksFetching(state: State) {
        return this.get(state, 'openBookmarksFetching') || this.get(state, 'closedBookmarksFetching')
    }

    static isSidebarDataLoaded(state: State) {
        return this.get(state, 'subscriptionsLoaded') && this.get(state, 'openBookmarksLoaded')
    }

}