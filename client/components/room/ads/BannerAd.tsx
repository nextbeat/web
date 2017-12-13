import * as React from 'react'

import Ad from '@models/entities/ad'

interface OwnProps {
    ad: Ad
}

type Props = OwnProps

class BannerAd extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.renderImages = this.renderImages.bind(this)
    }

    renderImages() {
        const { ad } = this.props
        if (ad.image().isEmpty()) {
            return null;
        }

        let divs: any[] = []

        let maybeAddImage = (type: string) => {
            if (ad.image(type).get('type') === type) {
                let className = `ad-banner_image ad-banner_image-${type}`
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
        let Elem = url  ? 'a' : 'div'
        let elemAttrs = url ? { href: url } : {}

        return (
            <Elem className="ad-banner" {...elemAttrs} >
                { this.renderImages() }
                { ad.get('sponsor') && <div className="ad-banner_sponsor">Sponsored by {ad.get('sponsor')}</div> }
                { ad.get('title') && <div className="ad-banner_title">{ad.get('title')}</div> }
            </Elem>
        )
    }

}

export default BannerAd;