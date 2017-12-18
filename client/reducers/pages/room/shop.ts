import { Map, fromJS } from 'immutable'
import { ActionType, Action, Status } from '@actions/types'

export default function shop(state = Map(), action: Action) {
    if (action.type === ActionType.ROOM_SHOP) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                isFetching: true,
                hasFetched: false
            }).delete('productIds')
              .delete('sponsor')
              .delete('sponsoredProductIds')
              .delete('error')
        } else if (action.status === Status.SUCCESS && action.response) {
            state = state.merge({
                isFetching: false,
                hasFetched: true,
                productIds: fromJS(action.response.result.products),
            })
            if (action.response.result.sponsored_products.length > 0) {
                const sponsoredProducts = action.response.result.sponsored_products[0]
                // We only want to support a single shop sponsor
                // per room for now, so we just use the first
                // returned result from the sponsored_products list
                state = state.merge({
                    sponsor: sponsoredProducts.sponsor,
                    sponsoredProductIds: fromJS(sponsoredProducts.products)
                })
            }
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                isFetching: false,
                error: action.error
            })
        }
    }
    return state
}