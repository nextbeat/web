import { List, Map } from 'immutable'

import { StateModelFactory } from '@models/state/base'
import User from '@models/entities/user'
import ShopProduct from '@models/entities/shopProduct'
import Emoji from '@models/objects/emoji'
import { createEntityListSelector, createSelector } from '@models/utils'
import { State } from '@types'

interface CommunityProps {
    isFetchingModerators: boolean
    hasFetchedModerators: boolean
    moderatorsError: string
    moderatorIds: List<number>

    isAddingModerator: boolean
    addModeratorError: string
    isRemovingModerator: boolean
    removeModeratorError: string

    isFetchingEmojis: boolean
    hasFetchedEmojis: boolean
    emojisError: string
    emojis: List<Map<string, any>>

    emojiFile?: File
    emojiFileError?: string
    isAddingEmoji: boolean
    addEmojiError: string
    isRemovingEmoji: boolean
    removeEmojiError: string

    isFetchingShopProducts: boolean
    hasFetchedShopProducts: boolean
    shopProductsError: string
    shopProductIds: List<number>

    isAddingShopProduct: boolean
    addShopProductError: string
    isRemovingShopProduct: boolean
    removeShopProductError: string
}

const keyMap = {
    'isFetchingModerators': ['moderators', 'isFetching'],
    'hasFetchedModerators': ['moderators', 'hasFetched'],
    'moderatorsError': ['moderators', 'error'],
    'moderatorIds': ['moderators', 'ids'],

    'isAddingModerator': ['moderators', 'isAdding'],
    'addModeratorError': ['moderators', 'addError'],
    'isRemovingModerator': ['moderators', 'isRemoving'],
    'removeModeratorError': ['moderators', 'removeError'],

    'isFetchingEmojis': ['emojis', 'isFetching'],
    'hasFetchedEmojis': ['emojis', 'hasFetched'],
    'emojisError': ['emojis', 'error'],
    'emojis': ['emojis', 'emojis'],

    'emojiFile': ['emojis', 'file'],
    'emojiFileError': ['emojis', 'fileError'],
    'isAddingEmoji': ['emojis', 'isAdding'],
    'addEmojiError': ['emojis', 'addError'],
    'isRemovingEmoji': ['emojis', 'isRemoving'],
    'removeEmojiError': ['emojis', 'removeError'],

    'isFetchingShopProducts': ['shop', 'isFetching'],
    'hasFetchedShopProducts': ['shop', 'hasFetched'],
    'shopProductsError': ['shop', 'error'],
    'shopProductIds': ['shop', 'ids'],

    'isAddingShopProduct': ['shop', 'isAdding'],
    'addShopProductError': ['shop', 'addError'],
    'isRemovingShopProduct': ['shop', 'isRemoving'],
    'removeShopProductError': ['shop', 'removeError']
}

const keyMapPrefix = ['pages', 'creator', 'community']

export default class Community extends StateModelFactory<CommunityProps>(keyMap, keyMapPrefix) {

    static moderators = createEntityListSelector(Community, 'moderatorIds', User)

    static emojis = createSelector(
        (state: State) => Community.get(state, 'emojis', List()).map(emojiState => new Emoji(emojiState))
    )(
        (state: State) => Community.get(state, 'emojis')
    )

    static shopProducts = createEntityListSelector(Community, 'shopProductIds', ShopProduct)
}