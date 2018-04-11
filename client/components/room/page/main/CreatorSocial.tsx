import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import CreatorSocialShopSponsor from './CreatorSocialShopSponsor'
import ShopProduct from '@components/room/page/shop/ShopProduct'
import Icon from '@components/shared/Icon'
import YoutubePlayer, { PlayerState as YoutubePlayerState } from '@components/shared/YoutubePlayer'
import TwitterTimeline from '@components/shared/TwitterTimeline'

import { gaEvent } from '@actions/ga'
import { Dimensions } from '@analytics/definitions'
import UserEntity, { UserSocial } from '@models/entities/user'
import ShopProductModel from '@models/entities/shopProduct'
import RoomPage from '@models/state/pages/room'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    roomId: number
    authorId: number

    shouldDisplayShop: boolean
    shopProducts: List<ShopProductModel>
    shopSponsors?: List<any>

    count: number
    youtube?: UserSocial
    instagram?: UserSocial
    twitter?: UserSocial
}

type Props = ConnectProps & DispatchProps

interface ComponentState {
    gridClass: string
    selectedPlatform?: string
}

class CreatorSocial extends React.PureComponent<Props, ComponentState> {

    private _node: HTMLDivElement

    constructor(props: Props) {
        super(props)

        this.handleResize = this.handleResize.bind(this)
        this.handleOutgoingClick = this.handleOutgoingClick.bind(this)
        this.handleYoutubePlayerStateChange = this.handleYoutubePlayerStateChange.bind(this)

        this.renderField = this.renderField.bind(this)
        this.renderYoutube = this.renderYoutube.bind(this)
        this.renderTwitter = this.renderTwitter.bind(this)

        this.state = {
            gridClass: '',
            selectedPlatform: this.defaultSelectedPlatform(this.props)
        }
    }

    defaultSelectedPlatform(props: Props): string | undefined {
        if (this.props.shouldDisplayShop) {
            return 'shop'
        } else if (this.props.youtube) {
            return 'google'
        } else if (this.props.twitter) {
            return 'twitter'
        } else if (this.props.instagram) {
            return 'instagram'
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize)
        this.handleResize()
    }

    componentWillReceiveProps(newProps: Props) {
        if (!this.state.selectedPlatform) {
            this.setState({
                selectedPlatform: this.defaultSelectedPlatform(newProps)
            })
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize)
    }

    handleResize() {
        if (!this._node) {
            return;
        }

        let gridClass = '';
        let nodeWidth = this._node.clientWidth;
        
        if (nodeWidth > 880) {
            gridClass = 'five-across'
        } else if (nodeWidth > 680) {
            gridClass = 'four-across'
        } else if (nodeWidth > 480) {
            gridClass = 'three-across'
        } else {
            gridClass = 'two-across'
        }

        this.setState({ gridClass })
    }

    handleOutgoingClick(social: UserSocial) {
        const { dispatch, roomId, authorId } = this.props

        dispatch(gaEvent({
            category: 'social',
            action: 'click',
            label: social.get('channel_id'),
            [Dimensions.STACK_ID]: roomId,
            [Dimensions.AUTHOR_ID]: authorId
        }, () => {
            window.open(social.get('channel_url'), '_blank')
        }))
    }

    handleYoutubePlayerStateChange(player: any, playerState: YoutubePlayerState) {
        if (playerState === YoutubePlayerState.PLAYING) {
            const { dispatch, roomId, authorId, youtube } = this.props
            dispatch(gaEvent({
                category: 'social',
                action: 'play',
                label: youtube!.get('post_id'),
                [Dimensions.STACK_ID]: roomId,
                [Dimensions.AUTHOR_ID]: authorId
            }))
        }
    }

    renderField(social: UserSocial | string) {
        const platform = typeof social === 'string' ? social.toLowerCase() : social.get('platform') 
        const title = typeof social === 'string' ? social : social.get('channel_name')
        const selectedClass = this.state.selectedPlatform === platform ? 'selected' : ''

        let onClick = () => {
            this.setState({ selectedPlatform: platform })
        }
        
        return (
            <li className={`creator-info_social_field creator-info_social_field-${platform} ${selectedClass}`} onClick={onClick}>
                <div className="creator-info_social_icon" />
                {title}
            </li>
        )
    }

    renderYoutube(display: boolean) {
        const youtube = this.props.youtube!
        const opts = {
            width: '100%',
            height: '100%',
            playerVars: {},
        }

        return (
            <div className="creator-info_social_content_inner creator-info_social_content_inner-youtube" style={{ display: display ? 'block' : 'none' }}>
                <div className="creator-info_social_content_outgoing" onClick={this.handleOutgoingClick.bind(this, youtube)}>Go to channel <Icon type="exit-to-app" /></div>
                <YoutubePlayer 
                    videoId={youtube.get('post_id')!} 
                    opts={opts} 
                    className="creator-info_social_youtube" 
                    onPlayerStateChange={this.handleYoutubePlayerStateChange} 
                />
            </div>
        )
    }

    renderTwitter(display: boolean) {
        const twitter = this.props.twitter!

        return (
            <div className="creator-info_social_content_inner creator-info_social_content_inner-twitter" style={{ display: display ? 'block' : 'none' }}>
                <div className="creator-info_social_content_outgoing" onClick={this.handleOutgoingClick.bind(this, twitter)}>Go to profile <Icon type="exit-to-app" /></div>
                <TwitterTimeline username={twitter.get('channel_name')!} className="creator-info_social_twitter" />
            </div>
        )
    }

    renderShop(display: boolean) {
        const { roomId, shouldDisplayShop, shopProducts, shopSponsors } = this.props
        const { gridClass } = this.state

        if (!shouldDisplayShop) {
            return null;
        }

        return (
            <div ref={(c) => { if (c) this._node = c; }} className="creator-info_social_shop" style={{ display: display ? 'block' : 'none' }}>
                <div className={`creator-info_social_shop_products ${gridClass}`}>
                    { shopSponsors && shopSponsors.map((ss, idx) => <CreatorSocialShopSponsor index={idx} key={idx}/>) }
                    { shopProducts.map(sp => <ShopProduct key={sp.get('id')} product={sp} roomId={roomId} styles={["square"]} />) }
                </div>
            </div>
        )
    }

    render() {
        const { count, shouldDisplayShop, youtube, instagram, twitter } = this.props
        const { selectedPlatform } = this.state

        if (count === 0 && !shouldDisplayShop) {
            return null;
        }

        return (
            <div className="creator-info_social">
                <ul className="creator-info_social_fields">
                    { shouldDisplayShop && this.renderField('Shop')}
                    { youtube && this.renderField(youtube) }
                    { twitter && this.renderField(twitter) }
                    { instagram && this.renderField(instagram) }
                </ul>
                <div className="creator-info_social_content">
                    { shouldDisplayShop && this.renderShop(selectedPlatform === "shop") }
                    { youtube && this.renderYoutube(selectedPlatform === "google") }
                    { twitter && this.renderTwitter(selectedPlatform === "twitter") }
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    const user = RoomPage.author(state)
    return {
        roomId: RoomPage.get(state, 'id'),
        authorId: RoomPage.author(state).get('id'),

        shouldDisplayShop: RoomPage.shouldDisplayShop(state),
        shopProducts: RoomPage.products(state),
        shopSponsors: RoomPage.get(state, 'sponsors'),
        
        count: user.get('social', List()).size,
        youtube: user.social('google'),
        instagram: user.social('instagram'),
        twitter: user.social('twitter')
    }
}

export default connect(mapStateToProps)(CreatorSocial)