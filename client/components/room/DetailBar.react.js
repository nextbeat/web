import React from 'react'

import { connect } from 'react-redux'
import { selectDetailSection, closeDetailSection, toggleDropdown, promptModal } from '../../actions'

import Chat from './chat/Chat.react'
import Activity from './activity/Activity.react'
import Icon from '../shared/Icon.react'
import Counter from './player/Counter.react'
import StackActions from './StackActions.react'
import Dropdown from '../shared/Dropdown.react'

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
        const { dispatch } = this.props
        return (
            <Dropdown type="detail-bar" triangleMargin={-1}>
                {/* <a className="dropdown-option">Edit Posts</a>
                <a className="dropdown-option">Edit Room</a> */}
                <a className="dropdown-option" onClick={() => {dispatch(promptModal('close-room'))}}>Close Room</a>
                <a className="dropdown-option" onClick={() => {dispatch(promptModal('delete-room'))}}>Delete Room</a>
            </Dropdown>
        )
    }

    renderBadge(stack) {
        const count = stack.unseenLiveMediaItemsCount()
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
        const { stack, app, handleSelectMediaItem, handleSelectNewestLiveItem  } = this.props;
        const selected = type => stack.get('selectedDetailSection', 'chat') === type ? "selected" : "";

        // collapse detail bar if window width below threshold
        const collapsedClass = app.get('width') === 'small' || app.get('width') === 'medium'
                                    ? 'collapsed' : ''

        const detailOverlayActive = app.get('activeOverlay') === 'chat' || app.get('activeOverlay') === 'activity'
        const activeClass = detailOverlayActive ? 'active' : ''

        const activityProps = {
            stack,
            mediaItems: stack.mediaItems(),
            liveMediaItems: stack.liveMediaItems(),
            selectedItem: stack.selectedMediaItem(),
            handleSelectMediaItem,
            handleSelectNewestLiveItem
        }


        return (
            <div className={`detail-bar ${collapsedClass} ${activeClass}`}>
                <StackActions stack={stack} />
                <div className="detail-bar_header">
                    { stack.currentUserIsAuthor() && 
                        <div className="detail-bar_toggle-edit" id="dropdown-detail-bar_toggle" onClick={this.toggleDropdown}><Icon type="more-vert" /></div> 
                    }
                    { this.renderDropdown() }
                    <div className="detail-bar_tab-container">
                        <span className={`detail-bar_tab ${selected("chat")}`} onClick={this.setSelected.bind(this, "chat")}>Chat</span>
                        <span className={`detail-bar_tab ${selected("activity")}`} onClick={this.setSelected.bind(this, "activity")}>Activity{this.renderBadge(stack)}</span>
                    </div>
                </div>
                <div className="detail-bar_main">
                    { detailOverlayActive && 
                        <div className="detail-bar_close" onClick={this.handleDetailOverlayClose} >
                            <Icon type="close" />
                        </div>
                    }
                    { !stack.get('isFetching') && !stack.get('error') && <Chat display={stack.get('selectedDetailSection', 'chat') === "chat"} /> }
                    { !stack.get('isFetching') && !stack.get('error') && <Activity display={stack.get('selectedDetailSection', 'chat') === "activity"} {...activityProps} /> }
                </div>
            </div>
        );
    }
}

export default connect()(DetailBar);
