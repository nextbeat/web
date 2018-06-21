import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import ShopModal from './ShopModal'
import Spinner from '@components/shared/Spinner'

import { promptModal } from '@actions/app'
import { loadShopProducts, removeShopProduct } from '@actions/pages/creator/community'
import Community from '@models/state/pages/creator/community'
import ShopProduct from '@models/entities/shopProduct'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    isFetching: boolean
    error?: string
    isAdding: boolean
    addError?: string
    isRemoving: boolean
    removeError?: string

    shopProducts: List<ShopProduct>
}

type Props = ConnectProps & DispatchProps

class Shop extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handlePromptClick = this.handlePromptClick.bind(this)
        this.handleRemoveClick = this.handleRemoveClick.bind(this)
    }

    componentDidMount() {
        this.props.dispatch(loadShopProducts())
    }

    componentDidUpdate(prevProps: Props) {
        const { isAdding, addError, isRemoving, removeError, dispatch } = this.props
        if ((prevProps.isAdding && !isAdding && !addError)
            || (prevProps.isRemoving && !isRemoving && !removeError)) 
        {
            dispatch(loadShopProducts())
        }
    }

    handlePromptClick() {
        this.props.dispatch(promptModal('add-shop-product'))
    }

    handleRemoveClick(shopProduct: ShopProduct) {
        this.props.dispatch(removeShopProduct(shopProduct))
    }

    renderShopProduct(product: ShopProduct) {
        const price         = product.get('price')
        const description   = product.get('description')

        return (
            <div className="community_box_element">
                <div 
                    className="community_box_element_thumbnail community_box_element_thumbnail-shop" 
                    style={{backgroundImage: `url(${product.image().get('url')})`}}
                />
                <div className="community_box_element_text community_box_element_text-multiline">
                    <div className="community_box_element_text_title"> { product.get('title') }</div>
                    { (price || description) && 
                        <div className="community_box_element_text_detail">
                            { price && <span style={{ marginRight: '3px' }}>${price}</span> }
                            { description && <span className="community_box_element_text_detail-description">{description}</span> }
                        </div>
                    }
                </div>
                <div className="community_box_element_remove" onClick={this.handleRemoveClick.bind(this, product)}>Remove</div>
            </div>
        )
    }

    render() {
        const { isFetching, isAdding, isRemoving, shopProducts } = this.props
        const isProcessing = isFetching || isAdding || isRemoving

        return (
            <div className="community_box community_box-shop">
                <ShopModal />
                <div className="community_box_list">
                    { isProcessing && <Spinner styles={["grey"]} /> }
                    { !isProcessing && shopProducts.map(product => this.renderShopProduct(product)) }
                </div>
                <div className="community_box_submit_container">
                    <div className="community_box_submit_fields">
                        <input type="submit" 
                            className="community_box_submit"
                            value="Add" 
                            onClick={this.handlePromptClick}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isFetching: Community.get(state, 'isFetchingShopProducts'),
        isAdding: Community.get(state, 'isAddingShopProduct'),
        addError: Community.get(state, 'addShopProductError'),
        isRemoving: Community.get(state, 'isRemovingShopProduct'),
        removeError: Community.get(state, 'removeShopProductError'),
        error: Community.get(state, 'shopProductsError'),
        shopProducts: Community.shopProducts(state)
    }
}

export default connect(mapStateToProps)(Shop)