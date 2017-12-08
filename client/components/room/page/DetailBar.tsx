import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Chat from './chat/Chat'
import Activity from './activity/Activity'
import BannerAd from '@components/room/ads/BannerAd'
import Icon from '@components/shared/Icon'
import ActionsDropdown from './ActionsDropdown'

import RoomPage from '@models/state/pages/room'
import App from '@models/state/app'
import Ad from '@models/entities/ad'
import { selectDetailSection, closeDetailSection } from '@actions/pages/room'
import { toggleDropdown, promptModal } from '@actions/app'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    width: string
    activeOverlay: string
    selectedDetailSection: 'chat' | 'activity'
    
    isCurrentUserAuthor: boolean
    unseenLiveMediaItemsCount: number

    bannerAd: Ad | null
}

type Props = ConnectProps & DispatchProps

interface DetailBarState {
    disableAnimations: boolean
    disableAnimationsTimeoutId: number
}

class DetailBar extends React.Component<Props, DetailBarState> {

    constructor(props: Props) {
        super(props);

        this.toggleDropdown = this.toggleDropdown.bind(this)
        this.renderBadge = this.renderBadge.bind(this)

        this.handleResize = this.handleResize.bind(this)

        this.state = {
            disableAnimations: false,
            disableAnimationsTimeoutId: -1
        }
    }

    componentDidMount() {
        $(window).on('resize.detail-bar', this.handleResize)
    }

    componentWillUnmount() {
        $(window).off('resize.detail-bar')
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

    setSelected(selected: 'chat' | 'activity') {
        this.props.dispatch(selectDetailSection(selected))
    }

    toggleDropdown() {
        this.props.dispatch(toggleDropdown('stack-actions-detail-bar'))
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
        const { selectedDetailSection, width, activeOverlay, 
                isCurrentUserAuthor, bannerAd } = this.props;
        const { disableAnimations } = this.state;

        const selected = (type: 'chat' | 'activity') => selectedDetailSection === type ? "selected" : "";

        // collapse detail bar if window width below threshold
        const collapsedClass = width === 'small' || width === 'medium' ? 'collapsed' : ''
        const disableAnimationsClass = disableAnimations ? 'detail-bar-disable-animations' : ''

        const detailOverlayActive = activeOverlay === 'chat' || activeOverlay === 'activity'
        const activeClass = detailOverlayActive ? 'active' : ''

        return (
            <div className={`detail-bar ${collapsedClass} ${activeClass} ${disableAnimationsClass}`}>
                { bannerAd && <BannerAd ad={bannerAd} /> }
                <div className="detail-bar_header">
                    { isCurrentUserAuthor && 
                        <div className="detail-bar_toggle-edit dropdown-detail-bar_toggle" onClick={this.toggleDropdown}><Icon type="more-vert" /></div> 
                    }
                    <ActionsDropdown type="detail-bar" />
                    <div className="detail-bar_tab-container">
                        <span className={`detail-bar_tab ${selected("chat")}`} onClick={this.setSelected.bind(this, "chat")}>Chat</span>
                        <span className={`detail-bar_tab ${selected("activity")}`} onClick={this.setSelected.bind(this, "activity")}>Activity{this.renderBadge()}</span>
                    </div>
                </div>
                <div className="detail-bar_main">
                    { <Chat display={selectedDetailSection === "chat"} /> }
                    { <Activity display={selectedDetailSection === "activity"} /> }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        selectedDetailSection: RoomPage.get(state, 'selectedDetailSection', 'chat'),
        width: App.get(state, 'width'),
        activeOverlay: App.get(state, 'activeOverlay'),
        isCurrentUserAuthor: RoomPage.isCurrentUserAuthor(state),
        unseenLiveMediaItemsCount: RoomPage.unseenLiveMediaItemsCount(state),
        bannerAd: RoomPage.ad(state, 'banner')
    }
}

export default connect(mapStateToProps)(DetailBar);
