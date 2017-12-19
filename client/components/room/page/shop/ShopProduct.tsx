import * as React from 'react'

import ShopProduct from '@models/entities/shopProduct'

interface OwnProps {
    product: ShopProduct
}

type Props = OwnProps

class ShopProductComponent extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        let url = this.props.product.get('url')
        if (!url) {
            return;
        }

        window.open(url, '_blank')
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

export default ShopProductComponent;