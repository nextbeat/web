import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import ShopProduct from '@components/room/page/shop/ShopProduct'
import Icon from '@components/shared/Icon'
import RoomPage from '@models/state/pages/room'
import ShopProductModel from '@models/entities/shopProduct'
import { State } from '@types'

interface OwnProps {
    index: number
}

interface ConnectProps {
    roomId: number
    products: List<ShopProductModel>
    name: string
}

type Props = OwnProps & ConnectProps;

class CreatorSocialShopSponsor extends React.Component<Props> {

    render() {
        const { products, roomId, name } = this.props

        if (!products || products.size === 0) {
            return null;
        }

        return products.map(product => 
            <ShopProduct key={product.get('id')} product={product} roomId={roomId} styles={["sponsored", "square"]} sponsor={name} />
        ).toJS()
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        roomId: RoomPage.get(state, 'id'),
        products: RoomPage.sponsorProducts(state, ownProps.index),
        name: RoomPage.sponsorName(state, ownProps.index)
    }
}

export default connect(mapStateToProps)(CreatorSocialShopSponsor);