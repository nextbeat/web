import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import ShopProduct from './ShopProduct'
import { expandShopSponsor } from '@actions/pages/room'
import Icon from '@components/shared/Icon'
import RoomPage from '@models/state/pages/room'
import ShopProductModel from '@models/entities/shopProduct'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    products: List<ShopProductModel>
    sponsor: string
    expanded: boolean
    authorUsername: string
}

type Props = ConnectProps & DispatchProps;


class ShopSponsor extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleExpand = this.handleExpand.bind(this)
    }

    handleExpand() {
        const { expanded, dispatch } = this.props
        dispatch(expandShopSponsor(!expanded))
    }

    render() {
        const { sponsor, products, authorUsername, expanded } = this.props

        if (!products || products.size === 0) {
            return null;
        }

        let productsSlice = expanded ? products : products.slice(0, 1)

        return (
            <div className="shop_sponsor">
                <div className="shop_sponsor_detail">
                    { authorUsername } is sponsored by { sponsor }
                </div>
                <div className="shop_sponsor_products">
                    { productsSlice.map(product => <ShopProduct key={product.get('id')} product={product} />) }
                </div>
                { products.size > 1 && 
                <div className="shop_sponsor_expand">
                    <div className="shop_sponsor_expand_button" onClick={this.handleExpand} >
                        { expanded ? "show less" : "show more" }
                        <Icon type={ expanded ? "expand-less" : "expand-more" } />
                    </div>
                </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        products: RoomPage.sponsoredProducts(state),
        sponsor: RoomPage.get(state, 'sponsoredProductsSponsor'),
        expanded: RoomPage.get(state, 'isSponsoredProductsExpanded'),
        authorUsername: RoomPage.author(state).get('username')
    }
}

export default connect(mapStateToProps)(ShopSponsor);