import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import ShopProduct from './ShopProduct'
import { expandShopSponsor } from '@actions/pages/room'
import Icon from '@components/shared/Icon'
import RoomPage from '@models/state/pages/room'
import ShopProductModel from '@models/entities/shopProduct'
import { State, DispatchProps } from '@types'

interface OwnProps {
    index: number
}

interface ConnectProps {
    roomId: number
    products: List<ShopProductModel>
    name: string
    expanded: boolean
}

type Props = OwnProps & ConnectProps & DispatchProps;


class ShopSponsor extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleExpand = this.handleExpand.bind(this)
    }

    handleExpand() {
        const { expanded, dispatch, index } = this.props
        dispatch(expandShopSponsor(!expanded, index))
    }

    render() {
        const { name, products,  expanded, roomId } = this.props

        if (!products || products.size === 0) {
            return null;
        }

        let productsSlice = expanded ? products : products.slice(0, 2)

        return (
            <div className="shop_sponsor">
                <div className="shop_sponsor_detail">
                    Nextbeat is sponsored by { name }
                </div>
                <div className="shop_sponsor_products">
                    { productsSlice.map(product => <ShopProduct key={product.get('id')} product={product} roomId={roomId} />) }
                </div>
                { products.size > 2 && 
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

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        roomId: RoomPage.get(state, 'id'),
        products: RoomPage.sponsorProducts(state, ownProps.index),
        name: RoomPage.sponsorName(state, ownProps.index),
        expanded: RoomPage.isSponsorExpanded(state, ownProps.index)
    }
}

export default connect(mapStateToProps)(ShopSponsor);