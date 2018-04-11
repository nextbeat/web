import * as React from 'react'
import { connect } from 'react-redux'

import { gaEvent } from '@actions/ga'
import { Dimensions } from '@analytics/definitions'
import ShopProduct from '@models/entities/shopProduct'
import { DispatchProps } from '@types'

interface OwnProps {
    product: ShopProduct
    roomId: number

    styles?: string[]
    sponsor?: string
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
        const { product, styles, sponsor } = this.props
        const thumbnailStyle = { backgroundImage: `url(${product.image().get('url')})` }
        const styleClass = (styles || []).map(style => `shop-product-${style}`).join(' ')

        return (
            <div className={`shop-product ${styleClass}`} onClick={this.handleClick}>
                <div className="shop-product_thumbnail">
                    <div className="shop-product_thumbnail_inner" style={thumbnailStyle} />
                </div>
                <div className="shop-product_main">
                    <div className="shop-product_title">{product.get('title')}</div>
                    { sponsor && <div className="shop-product_sponsor">Sponsored by {sponsor}</div> }
                    { product.get('price') && <div className="shop-product_price">${product.get('price')}</div> }
                    { product.get('description') && <div className="shop-product_description">{product.get('description')}</div> }
                </div>
            </div>
        )
    }
}

export default connect()(ShopProductComponent);