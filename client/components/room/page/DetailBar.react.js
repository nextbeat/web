import React from 'react'

import { connect } from 'react-redux'
import { Link } from 'react-router'
import { RoomPage, App } from '../../../models'
import { selectDetailSection, closeDetailSection, toggleDropdown, promptModal } from '../../../actions'

import Chat from './chat/Chat.react'
import Activity from './activity/Activity.react'
import Icon from '../../shared/Icon.react'
import ActionsDropdown from './ActionsDropdown.react'

class DetailBar extends React.Component {

    constructor(props) {
        super(props);

        this.handleDetailOverlayClose = this.handleDetailOverlayClose.bind(this)
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
        clearTimeout(this.state.disableAnimationsTimeoutId)

        const disableAnimationsTimeoutId = setTimeout(() => {
            this.setState({ disableAnimations: false })
        }, 300)

        this.setState({
            disableAnimationsTimeoutId,
            disableAnimations: true
        })
    }

    // Actions

    setSelected(selected) {
        this.props.dispatch(selectDetailSection(selected))
    }

    handleDetailOverlayClose() {
        this.props.dispatch(closeDetailSection())
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
                currentUserIsAuthor, isFetchingPage, pageError } = this.props;
        const { disableAnimations } = this.state;

        const selected = type => selectedDetailSection === type ? "selected" : "";

        // collapse detail bar if window width below threshold
        const collapsedClass = width === 'small' || width === 'medium' ? 'collapsed' : ''
        const disableAnimationsClass = disableAnimations ? 'detail-bar-disable-animations' : ''

        const detailOverlayActive = activeOverlay === 'chat' || activeOverlay === 'activity'
        const activeClass = detailOverlayActive ? 'active' : ''

        return (
            <div className={`detail-bar ${collapsedClass} ${activeClass} ${disableAnimationsClass}`}>
                <div className="detail-bar_header">
                    { currentUserIsAuthor && 
                        <div className="detail-bar_toggle-edit" id="dropdown-detail-bar_toggle" onClick={this.toggleDropdown}><Icon type="more-vert" /></div> 
                    }
                    <ActionsDropdown type="detail-bar" />
                    <div className="detail-bar_tab-container">
                        <span className={`detail-bar_tab ${selected("chat")}`} onClick={this.setSelected.bind(this, "chat")}>Chat</span>
                        <span className={`detail-bar_tab ${selected("activity")}`} onClick={this.setSelected.bind(this, "activity")}>Activity{this.renderBadge()}</span>
                    </div>
                </div>
                <div className="detail-bar_main">
                    { detailOverlayActive && 
                        <div className="detail-bar_close" onClick={this.handleDetailOverlayClose} >
                            <Icon type="close" />
                            Collapse
                        </div>
                    }
                    { !isFetchingPage && !pageError && <Chat display={selectedDetailSection === "chat"} /> }
                    { !isFetchingPage && !pageError && <Activity display={selectedDetailSection === "activity"} /> }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    let roomPage = new RoomPage(state)
    let app = new App(state)
    return {
        selectedDetailSection: roomPage.get('selectedDetailSection', 'chat'),
        width: app.get('width'),
        activeOverlay: app.get('activeOverlay'),
        currentUserIsAuthor: roomPage.currentUserIsAuthor(),
        isFetchingPage: roomPage.get('isFetching'),
        pageError: roomPage.get('error'),
        unseenLiveMediaItemsCount: roomPage.get('unseenLiveMediaItemsCount', 0)
    }
}

export default connect(mapStateToProps)(DetailBar);
