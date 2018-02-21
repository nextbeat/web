import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Chat from './chat/Chat'
import Activity from './activity/Activity'
import Shop from './shop/Shop'
import BannerAd from '@components/room/ads/BannerAd'
import Icon from '@components/shared/Icon'
import ActionsDropdown from './ActionsDropdown'

import RoomPage, { DetailSection } from '@models/state/pages/room'
import App from '@models/state/app'
import Ad from '@models/entities/ad'
import { selectDetailSection, closeDetailSection, logShopImpression } from '@actions/pages/room'
import { toggleDropdown, promptModal } from '@actions/app'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    width: string
    activeOverlay: string
    selectedDetailSection: DetailSection
    shouldDisplayShop: boolean
    
    roomId: number
    isCurrentUserAuthor: boolean
    unseenLiveMediaItemsCount: number

    bannerAd: Ad | null
}

type Props = ConnectProps & DispatchProps

interface DetailBarState {
    disableAnimations: boolean
    disableAnimationsTimeoutId: number

    shopImpressionStartTime: number
}

class DetailBar extends React.Component<Props, DetailBarState> {

    constructor(props: Props) {
        super(props);

        this.toggleDropdown = this.toggleDropdown.bind(this)
        this.renderBadge = this.renderBadge.bind(this)

        this.handleResize = this.handleResize.bind(this)
        this.handleClose = this.handleClose.bind(this)
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this)
        
        this.startNewShopImpression = this.startNewShopImpression.bind(this)
        this.logShopImpression = this.logShopImpression.bind(this)

        this.state = {
            disableAnimations: false,
            disableAnimationsTimeoutId: -1,
            shopImpressionStartTime: - 1
        }
    }

    componentDidMount() {
        $(window).on('resize.detail-bar', this.handleResize)
        window.addEventListener('beforeunload', this.logShopImpression)
        window.addEventListener('visibilitychange', this.handleVisibilityChange)
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.selectedDetailSection !== 'shop' && this.props.selectedDetailSection === 'shop') {
            this.startNewShopImpression()
        }

        if (prevProps.selectedDetailSection === 'shop' && this.props.selectedDetailSection !== 'shop') {
            this.logShopImpression()
        }
    }

    componentWillUnmount() {
        $(window).off('resize.detail-bar')
        window.removeEventListener('beforeunload', this.logShopImpression)
        window.removeEventListener('visibilitychange', this.handleVisibilityChange)

        this.logShopImpression()
    }

    handleResize() {
        // disable animations for small amount of time, so 
        // that resizing does not trigger collapse animation
        window.clearTimeout(this.state.disableAnimationsTimeoutId)

        const disableAnimationsTimeoutId = window.setTimeout(() => {
            this.setState({ disableAnimations: false })
        }, 300)

        this.setState({
            disableAnimationsTimeoutId,
            disableAnimations: true
        })
    }

    // Actions

    setSelected(selected: DetailSection) {
        this.props.dispatch(selectDetailSection(selected))
    }

    toggleDropdown() {
        this.props.dispatch(toggleDropdown('stack-actions-detail-bar'))
    }

    handleClose() {
        this.props.dispatch(closeDetailSection())
        this.logShopImpression()
    }

    // Impressions

    handleVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            // lost tab focus
            this.logShopImpression()
        } else if (document.visibilityState === 'visible') {
            // regained tab focus
            this.startNewShopImpression()
        }
    }

    startNewShopImpression() {
        if (!performance || this.props.selectedDetailSection !== 'shop') {
            return;
        }

        this.setState({
            shopImpressionStartTime: performance.now()
        })
    }

    logShopImpression() {
        const { shopImpressionStartTime } = this.state
        if (shopImpressionStartTime < 0) {
            return;
        }

        const duration = Math.floor((performance.now() - shopImpressionStartTime)/1000)
        if (duration === 0) {
            return;
        }

        this.props.dispatch(logShopImpression(duration))

        this.setState({
            shopImpressionStartTime: -1
        })
    }


    // Render

    renderBadge() {
        const count = this.props.unseenLiveMediaItemsCount
        if (count === 0) {
            return null;
        }
        return (
            <div className="detail-bar_activity-badge">
                <span className="detail-bar_activity-badge_inner">{count}</span>
            </div>
        )
    }

    render() {
        const { selectedDetailSection, width, activeOverlay, roomId,
                isCurrentUserAuthor, bannerAd, shouldDisplayShop } = this.props;
        const { disableAnimations } = this.state;

        const selected = (type: DetailSection) => selectedDetailSection === type ? "selected" : "";

        const disableAnimationsClass = disableAnimations ? 'detail-bar-disable-animations' : ''
        const detailOverlayActive = activeOverlay === 'chat' || activeOverlay === 'activity' || activeOverlay === 'shop'
        const activeClass = detailOverlayActive ? 'active' : ''

        return (
            <div className={`detail-bar ${activeClass} ${disableAnimationsClass}`}>
                { bannerAd && <BannerAd ad={bannerAd} roomId={roomId} /> }
                <div className="detail-bar_header">
                    { isCurrentUserAuthor && 
                        <div className="detail-bar_toggle-edit dropdown-detail-bar_toggle" onClick={this.toggleDropdown}><Icon type="more-vert" /></div> 
                    }
                    { detailOverlayActive &&
                        <div className="detail-bar_close" onClick={this.handleClose}><Icon type="expand-more" /></div>
                    }
                    <ActionsDropdown type="detail-bar" />
                    <div className="detail-bar_tab-container">
                        <span className={`detail-bar_tab ${selected("chat")}`} onClick={this.setSelected.bind(this, "chat")}>Chat</span>
                        <span className={`detail-bar_tab ${selected("activity")}`} onClick={this.setSelected.bind(this, "activity")}>Activity{this.renderBadge()}</span>
                        { shouldDisplayShop && <span className={`detail-bar_tab ${selected("shop")}`} onClick={this.setSelected.bind(this, "shop")}>Shop</span>}
                    </div>
                </div>
                <div className="detail-bar_main">
                    { <Chat display={selectedDetailSection === "chat"} /> }
                    { <Activity display={selectedDetailSection === "activity"} /> }
                    { <Shop display={selectedDetailSection === "shop"} /> }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        selectedDetailSection: RoomPage.get(state, 'selectedDetailSection', 'chat'),
        shouldDisplayShop: RoomPage.shouldDisplayShop(state),
        width: App.get(state, 'width'),
        activeOverlay: App.get(state, 'activeOverlay'),
        roomId: RoomPage.get(state, 'id'),
        isCurrentUserAuthor: RoomPage.isCurrentUserAuthor(state),
        unseenLiveMediaItemsCount: RoomPage.unseenLiveMediaItemsCount(state),
        bannerAd: RoomPage.ad(state, 'banner')
    }
}

export default connect(mapStateToProps)(DetailBar);
