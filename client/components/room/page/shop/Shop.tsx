import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import RoomPage from '@models/state/pages/room'
import ShopProductModel from '@models/entities/shopProduct'
import ShopProduct from './ShopProduct'
import ShopSponsor from './ShopSponsor'
import { State, DispatchProps } from '@types'

interface OwnProps {
    display: boolean
}

interface ConnectProps {
    roomId: number
    products: List<ShopProductModel>
    sponsors?: List<any>
}

type Props = OwnProps & ConnectProps & DispatchProps

class Shop extends React.Component<Props> {
    render() {
        const { display, products, sponsors, roomId } = this.props
        return (
            <div className={`shop ${display ? 'selected' : 'unselected'}`}>
                { sponsors && sponsors.map((sponsor, idx) => <ShopSponsor key={idx} index={idx} />)}
                { products.map(product => <ShopProduct key={product.get('id')} product={product} roomId={roomId} />)}
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        roomId: RoomPage.get(state, 'id'),
        products: RoomPage.products(state),
        sponsors: RoomPage.get(state, 'sponsors')
    }
}

export default connect(mapStateToProps)(Shop)