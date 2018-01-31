import * as React from 'react'
import { connect } from 'react-redux'

import { gaEvent } from '@actions/ga'
import { Dimensions } from '@analytics/definitions'
import ShopProduct from '@models/entities/shopProduct'
import { DispatchProps } from '@types'

interface OwnProps {
    product: ShopProduct
    roomId: number
}

type Props = OwnProps & DispatchProps

class ShopProductComponent extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        const { product, roomId, dispatch } = this.props
        if (!product.get('url')) {
            return;
        }

        dispatch(gaEvent({
            category: 'shop',
            action: 'click',
            [Dimensions.STACK_ID]: roomId,
            [Dimensions.SHOP_PRODUCT_ID]: product.get('id')
        }, () => {
            window.open(product.get('url'), '_blank')
        }))
    }

    render() {
        const { product } = this.props
        const thumbnailStyle = { backgroundImage: `url(${product.image().get('url')})` }

        return (
            <div className="shop-product" onClick={this.handleClick}>
                <div className="shop-product_thumbnail" style={thumbnailStyle} />
                <div className="shop-product_main">
                    <div className="shop-product_title">{product.get('title')}</div>
                    { (product.get('price') || true) && <div className="shop-product_price">{product.get('price') || '$6.99'}</div> }
                    { product.get('description') && <div className="shop-product_description">{product.get('description')}</div> }
                </div>
            </div>
        )
    }
}

export default connect()(ShopProductComponent);