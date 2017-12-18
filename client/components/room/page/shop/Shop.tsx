import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import RoomPage from '@models/state/pages/room'
import ShopProductModel from '@models/entities/shopProduct'
import ShopProduct from './ShopProduct'
import { State, DispatchProps } from '@types'

interface OwnProps {
    display: boolean
}

interface ConnectProps {
    products: List<ShopProductModel>
    sponsoredProducts: List<ShopProductModel>
    sponsorName?: string
}

type Props = OwnProps & ConnectProps & DispatchProps

class Shop extends React.Component<Props> {
    render() {
        const { display, products } = this.props
        return (
            <div className="shop" style={{ display: display ? 'flex' : 'none' }}>
                <div className="shop_products">
                    { products.map(product => <ShopProduct key={product.get('id')} product={product} />)}
                    { products.map(product => <ShopProduct key={product.get('id')} product={product} />)}
                    { products.map(product => <ShopProduct key={product.get('id')} product={product} />)}
                    { products.map(product => <ShopProduct key={product.get('id')} product={product} />)}
                    { products.map(product => <ShopProduct key={product.get('id')} product={product} />)}
                    { products.map(product => <ShopProduct key={product.get('id')} product={product} />)}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        products: RoomPage.products(state),
        sponsoredProducts: RoomPage.sponsoredProducts(state),
        sponsorName: RoomPage.get(state, 'sponsoredProductsSponsor')
    }
}

export default connect(mapStateToProps)(Shop)