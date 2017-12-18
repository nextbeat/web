import * as React from 'react'

import ShopProduct from '@models/entities/shopProduct'

interface OwnProps {
    product: ShopProduct
}

type Props = OwnProps

class ShopProductComponent extends React.Component<Props> {

    render() {
        const { product } = this.props
        const thumbnailStyle = { backgroundImage: `url(${product.image().get('url')})` }

        return (
            <div className="shop-product">
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

export default ShopProductComponent;