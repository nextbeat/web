import * as React from 'react'

import Ad from '@models/entities/ad'

interface OwnProps {
    ad: Ad
}

class BannerAd extends React.Component<OwnProps> {

    render() {
        const { ad } = this.props
        return (
            <div className="ad-banner">
                { ad.get('sponsor') && <div className="ad-banner_sponsor">Sponsored by {ad.get('sponsor')}</div> }
                { ad.get('title') && <div className="ad-banner_title">{ad.get('title')}</div> }
            </div>
        )
    }

}

export default BannerAd;