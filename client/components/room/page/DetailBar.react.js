import React from 'react'

import { connect } from 'react-redux'
import { Link } from 'react-router'
import { RoomPage, App } from '../../../models'
import { selectDetailSection, closeDetailSection, toggleDropdown, promptModal } from '../../../actions'

import Chat from './chat/Chat.react'
import Activity from './activity/Activity.react'
import Icon from '../../shared/Icon.react'
import StackActions from './StackActions.react'
import Dropdown from '../../shared/Dropdown.react'

class DetailBar extends React.Component {

    constructor(props) {
        super(props);

        this.handleDetailOverlayClose = this.handleDetailOverlayClose.bind(this)
        this.toggleDropdown = this.toggleDropdown.bind(this)
    }


    // Actions

    setSelected(selected) {
        this.props.dispatch(selectDetailSection(selected))
    }

    handleDetailOverlayClose() {
        this.props.dispatch(closeDetailSection())
    }

    toggleDropdown() {
        this.props.dispatch(toggleDropdown('detail-bar'))
    }


    // Render

    renderDropdown() {
        const { dispatch, roomPage } = this.props
        return (
            <Dropdown type="detail-bar" triangleMargin={-1}>
                <Link to={`/r/${roomPage.get('hid')}/edit`} className="dropdown-option">Edit Room</Link>
                { !roomPage.get('closed') && <a className="dropdown-option" onClick={() => {dispatch(promptModal('close-room'))}}>Close Room</a> }
                <a className="dropdown-option" onClick={() => {dispatch(promptModal('delete-room'))}}>Delete Room</a>
            </Dropdown>
        )
    }

    renderBadge(roomPage) {
        const count = roomPage.unseenLiveMediaItemsCount()
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
        const { roomPage, app } = this.props;
        const selected = type => roomPage.get('selectedDetailSection', 'chat') === type ? "selected" : "";

        // collapse detail bar if window width below threshold
        const collapsedClass = app.get('width') === 'small' || app.get('width') === 'medium'
                                    ? 'collapsed' : ''

        const detailOverlayActive = app.get('activeOverlay') === 'chat' || app.get('activeOverlay') === 'activity'
        const activeClass = detailOverlayActive ? 'active' : ''

        return (
            <div className={`detail-bar ${collapsedClass} ${activeClass}`}>
                <StackActions />
                <div className="detail-bar_header">
                    { roomPage.currentUserIsAuthor() && 
                        <div className="detail-bar_toggle-edit" id="dropdown-detail-bar_toggle" onClick={this.toggleDropdown}><Icon type="more-vert" /></div> 
                    }
                    { this.renderDropdown() }
                    <div className="detail-bar_tab-container">
                        <span className={`detail-bar_tab ${selected("chat")}`} onClick={this.setSelected.bind(this, "chat")}>Chat</span>
                        <span className={`detail-bar_tab ${selected("activity")}`} onClick={this.setSelected.bind(this, "activity")}>Activity{this.renderBadge(roomPage)}</span>
                    </div>
                </div>
                <div className="detail-bar_main">
                    { detailOverlayActive && 
                        <div className="detail-bar_close" onClick={this.handleDetailOverlayClose} >
                            <Icon type="close" />
                        </div>
                    }
                    { !roomPage.get('isFetching') && !roomPage.get('error') && <Chat display={roomPage.get('selectedDetailSection', 'chat') === "chat"} /> }
                    { !roomPage.get('isFetching') && !roomPage.get('error') && <Activity display={roomPage.get('selectedDetailSection', 'chat') === "activity"} /> }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        roomPage: new RoomPage(state),
        app: new App(state)
    }
}

export default connect(mapStateToProps)(DetailBar);
