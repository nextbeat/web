import assign from 'lodash-es/assign'

import { 
    ActionType, 
    ApiCallAction, 
    ApiCancelAction,
    GenericAction,
    ThunkAction,
    ApiCall,
    Action
} from '@actions/types'
import { triggerAuthError } from '@actions/app'

import CurrentUser from '@models/state/currentUser'
import * as Schemas from '@schemas'
import Emoji from '@models/objects/emoji'
import ShopProduct from '@models/entities/shopProduct'

export type CommunityActionAll = 
    ModeratorsAction |
    EmojisAction |
    SelectEmojiFileAction |
    SetEmojiFileErrorAction |
    AddEmojiAction |
    RemoveEmojiAction |
    ShopProductsAction |
    AddShopProductAction |
    RemoveShopProductAction |
    ClearCommunityAction

/************
 * MODERATORS
 ************/

export interface ModeratorsAction extends ApiCallAction {
    type: ActionType.MODERATORS,
    creatorId: number
}
function fetchModerators(creatorId: number): ModeratorsAction {
    return {
        type: ActionType.MODERATORS,
        creatorId,
        API_CALL: {
            endpoint: `users/${creatorId}/moderators`,
            schema: Schemas.Users
        }
    }
}

export function loadModerators(): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()

        if (!CurrentUser.isLoggedIn(state)) {
            return null;
        }

        dispatch(fetchModerators(CurrentUser.get(state, 'id')))
    }
}

/********
 * EMOJIS
 ********/

export interface EmojisAction extends ApiCallAction {
    type: ActionType.EMOJIS
}
function fetchEmojis(creatorId: number): EmojisAction {
    return {
        type: ActionType.EMOJIS,
        API_CALL: {
            endpoint: `users/${creatorId}/emojis`
        }
    }
}

export function loadEmojis(): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()

        if (!CurrentUser.isLoggedIn(state)) {
            return null;
        }

        dispatch(fetchEmojis(CurrentUser.get(state, 'id')))
    }
}

export interface SelectEmojiFileAction extends GenericAction {
    type: ActionType.SELECT_EMOJI_FILE,
    file?: File
}
export function selectEmojiFile(file?: File): SelectEmojiFileAction {
    return {
        type: ActionType.SELECT_EMOJI_FILE,
        file
    }
}

export interface SetEmojiFileErrorAction extends GenericAction {
    type: ActionType.SET_EMOJI_FILE_ERROR,
    error?: string
}
export function setEmojiFileError(error?: string): SetEmojiFileErrorAction {
    return {
        type: ActionType.SET_EMOJI_FILE_ERROR,
        error
    }
}

export interface AddEmojiAction extends ApiCallAction {
    type: ActionType.ADD_EMOJI,
    name: string
}
function performAddEmoji(creatorId: number, emoji: EmojiObject): AddEmojiAction {
    return {
        type: ActionType.ADD_EMOJI,
        name: emoji.name,
        API_CALL: {
            endpoint: `users/${creatorId}/emojis`,
            method: 'POST',
            authenticated: true,
            body: assign({}, emoji)
        }
    }
}

interface EmojiObject {
    name: string
    image: string
    width: number
    height: number
}
export function addEmoji(emoji: EmojiObject): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()

        if (!CurrentUser.isLoggedIn(state)) {
            return null;
        }

        dispatch(performAddEmoji(CurrentUser.get(state, 'id'), emoji))
    }
}

export interface RemoveEmojiAction extends ApiCallAction {
    type: ActionType.REMOVE_EMOJI,
    id: number
}
function performRemoveEmoji(creatorId: number, emojiId: number): RemoveEmojiAction {
    return {
        type: ActionType.REMOVE_EMOJI,
        id: emojiId,
        API_CALL: {
            endpoint: `users/${creatorId}/emojis/${emojiId}`,
            method: 'DELETE',
            authenticated: true
        }
    }
}

export function removeEmoji(emoji: Emoji): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()

        if (!CurrentUser.isLoggedIn(state)) {
            return null;
        }

        dispatch(performRemoveEmoji(CurrentUser.get(state, 'id'), emoji.get('id')))
    }
}

/******
 * SHOP
 ******/

export interface ShopProductsAction extends ApiCallAction {
    type: ActionType.SHOP_PRODUCTS
}
function fetchShopProducts(userId: number): ShopProductsAction {
    return {
        type: ActionType.SHOP_PRODUCTS,
        API_CALL: {
            endpoint: `users/${userId}/shop/products`,
            method: 'GET',
            schema: Schemas.ShopProducts
        }
    }
}
export function loadShopProducts(): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()

        if (!CurrentUser.isLoggedIn(state)) {
            return null;
        }

        dispatch(fetchShopProducts(CurrentUser.get(state, 'id')))
    }
}

export interface AddShopProductAction extends ApiCallAction {
    type: ActionType.ADD_SHOP_PRODUCT
}
function performAddShopProduct(userId: number, shopProduct: ShopProductObject): AddShopProductAction {
    return {
        type: ActionType.ADD_SHOP_PRODUCT,
        API_CALL: {
            endpoint: `users/${userId}/shop/products`,
            method: 'POST',
            authenticated: true,
            body: assign({}, shopProduct)
        }
    }
}

interface ShopProductObject {
    title: string
    url: string
    images: {
        url: string
        width: number
        height: number
    }[]
    price?: string
    description?: string
}
export function addShopProduct(shopProduct: ShopProductObject): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()

        if (!CurrentUser.isLoggedIn(state)) {
            return null;
        }

        dispatch(performAddShopProduct(CurrentUser.get(state, 'id'), shopProduct))
    }
}

export interface RemoveShopProductAction extends ApiCallAction {
    type: ActionType.REMOVE_SHOP_PRODUCT,
    id: number
}
function performRemoveShopProduct(creatorId: number, shopProductId: number): RemoveShopProductAction {
    return {
        type: ActionType.REMOVE_SHOP_PRODUCT,
        id: shopProductId,
        API_CALL: {
            endpoint: `users/${creatorId}/shop/products/${shopProductId}`,
            method: 'DELETE',
            authenticated: true
        }
    }
}

export function removeShopProduct(shopProduct: ShopProduct): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()

        if (!CurrentUser.isLoggedIn(state)) {
            return null;
        }

        dispatch(performRemoveShopProduct(CurrentUser.get(state, 'id'), shopProduct.get('id')))
    }
}

/*******
 * CLEAR
 *******/

export interface ClearCommunityAction extends ApiCancelAction {
    type: ActionType.CLEAR_COMMUNITY
}

export function clearCommunity(): ApiCancelAction {
    return {
        type: ActionType.CLEAR_COMMUNITY,
        API_CANCEL: {
            actionTypes: [ActionType.MODERATORS, ActionType.EMOJIS, ActionType.ADD_EMOJI, ActionType.REMOVE_EMOJI, ActionType.SHOP_PRODUCTS]
        }
    }
}