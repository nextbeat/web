import * as React from 'react'
import { connect } from 'react-redux'

import { gaEvent } from '@actions/ga'
import { Dimensions } from '@analytics/definitions'
import Ad from '@models/entities/ad'
import { DispatchProps } from '@types'

interface OwnProps {
    ad: Ad
    roomId: number
}

type Props = OwnProps & DispatchProps

class BannerAd extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.onClick = this.onClick.bind(this)
        this.renderImages = this.renderImages.bind(this)
    }

    onClick(e: React.MouseEvent<HTMLElement>) {

        const { dispatch, ad, roomId } = this.props
        e.preventDefault();

        dispatch(gaEvent({
            category: 'ad',
            action: 'click',
            label: 'banner',
            [Dimensions.SHOP_PRODUCT_ID]: ad.get('id'),
            [Dimensions.STACK_ID]: roomId
        }, () => {
            window.open(ad.get('link_url'), '_blank')
        }))
    }

    renderImages() {
        const { ad } = this.props
        if (ad.image().isEmpty()) {
            return null;
        }

        let divs: any[] = []

        let maybeAddImage = (type: string) => {
            if (ad.image(type).get('type') === type) {
                let className = `ad-banner-nb_image ad-banner-nb_image-${type}`
                let style = { backgroundImage: `url(${ad.image(type).get('url')})` }
                divs.push(<div key={type} className={className} style={style} />)
            }
        }

        maybeAddImage('large')
        maybeAddImage('medium')
        maybeAddImage('small')

        return divs
    }

    render() {
        const { ad } = this.props

        let url = ad.get('link_url')
        let Elem = url ? 'a' : 'div'
        let elemAttrs = url ? { href: url, target: '_blank', onClick: this.onClick } : {}

        return (
            <Elem className="ad-banner-nb" {...elemAttrs} >
                { this.renderImages() }
                { ad.get('sponsor') && <div className="ad-banner-nb_sponsor">Sponsored by {ad.get('sponsor')}</div> }
                { ad.get('title') && <div className="ad-banner-nb_title">{ad.get('title')}</div> }
            </Elem>
        )
    }

}

export default connect()(BannerAd);