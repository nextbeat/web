import { Map, List, fromJS } from 'immutable'
import { ActionType, Action, Status } from '@actions/types'

export default function shop(state = Map(), action: Action) {
    if (action.type === ActionType.ROOM_SHOP) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                isFetching: true,
                hasFetched: false
            }).delete('productIds')
              .delete('sponsoredProducts')
              .delete('error')
        } else if (action.status === Status.SUCCESS && action.response) {
            state = state.merge({
                isFetching: false,
                hasFetched: true,
                productIds: fromJS(action.response.result.products),
            })
            if (action.response.result.sponsored_products.length > 0) {
                const sponsors = fromJS(action.response.result.sponsored_products) as List<any>
                // We only want to support a single shop sponsor
                // per room for now, so we just use the first
                // returned result from the sponsored_products list
                state = state.merge({
                    sponsors: sponsors.map(sponsor => Map({
                        name: sponsor.get('sponsor'),
                        productIds: sponsor.get('products', List()),
                        expanded: false
                    }))
                })
            }
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                isFetching: false,
                error: action.error
            })
        }
    } else if (action.type === ActionType.EXPAND_SHOP_SPONSOR) {
        return state.update('sponsors', ((sponsors: List<any>) => 
            sponsors.update(action.index, (sponsor: Map<any, any>) => 
                sponsor.set('expanded', action.expanded)
            )
        ))
    }
    return state
}