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
    products: List<ShopProductModel>
    sponsoredProducts: List<ShopProductModel>
}

type Props = OwnProps & ConnectProps & DispatchProps

class Shop extends React.Component<Props> {
    render() {
        const { display, products, sponsoredProducts } = this.props
        return (
            <div className="shop" style={{ display: display ? 'block' : 'none' }}>
                { sponsoredProducts.size > 0 && <ShopSponsor /> }
                { products.map(product => <ShopProduct key={product.get('id')} product={product} />)}
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        products: RoomPage.products(state),
        sponsoredProducts: RoomPage.sponsoredProducts(state)
    }
}

export default connect(mapStateToProps)(Shop)