import { Map, List, fromJS } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { 
    ShopProductsAction, 
    AddShopProductAction, 
    RemoveShopProductAction 
} from '@actions/pages/creator/community'
import { State } from '@types'

function shopProducts(state: State, action: ShopProductsAction) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            isFetching: true,
            hasFetched: false
        }).deleteAll(['error', 'addError', 'removeError'])
    } else if (action.status === Status.SUCCESS && action.response) {
        return state.merge({
            isFetching: false,
            hasFetched: true,
            ids: fromJS(action.response.result)
        })
    } else if (action.stats === Status.FAILURE) {
        return state.merge({
            hasFetched: false,
            error: action.error
        })
    }
    return state
}

function addShopProduct(state: State, action: AddShopProductAction) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            isAdding: true
        }).deleteAll(['error', 'addError', 'removeError'])
    } else if (action.status === Status.SUCCESS) {
        return state.merge({
            isAdding: false
        })
    } else if (action.status === Status.FAILURE) {
        return state.merge({
            isAdding: false,
            addError: action.error
        })
    }
    return state
}

function removeShopProduct(state: State, action: RemoveShopProductAction) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            isRemoving: true
        }).deleteAll(['error', 'addError', 'removeError'])
    } else if (action.status === Status.SUCCESS) {
        return state.merge({
            isRemoving: false
        })
    } else if (action.status === Status.FAILURE) {
        return state.merge({
            isRemoving: false,
            removeError: action.error
        })
    }
    return state
}


export default function(state: State = Map(), action: Action) {
    if (action.type === ActionType.SHOP_PRODUCTS) {
        return shopProducts(state, action)
    } else if (action.type === ActionType.ADD_SHOP_PRODUCT) {
        return addShopProduct(state, action)
    } else if (action.type === ActionType.REMOVE_SHOP_PRODUCT) {
        return removeShopProduct(state, action)
    }
    return state;
}

