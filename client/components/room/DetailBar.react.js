import React from 'react'

import Chat from './chat/Chat.react'
import Activity from './activity/Activity.react'
import Icon from '../shared/Icon.react'

class DetailBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selected: "chat"
        }
    }

    setSelected(selected) {
        this.setState({ selected })
        console.log('adding class');
        $('.detail-bar_main').addClass('active');
    }


    setInactive() {
        $('.detail-bar_main').removeClass('active');
    }

    render() {
        const selected = type => this.state.selected === type ? "selected" : "";
        const { stack, handleSelectMediaItem, handleSelectNewestLiveItem  } = this.props;
        const activityProps = {
            stack,
            mediaItems: stack.mediaItems(),
            liveMediaItems: stack.liveMediaItems(),
            selectedItem: stack.selectedMediaItem(),
            handleSelectMediaItem,
            handleSelectNewestLiveItem
        }
        return (
            <div className="detail-bar">
                <div className="detail-bar_expanded">
                    <div className="detail-bar_header">
                        <div className="detail-bar_tab-container">
                            <span className={`detail-bar_tab ${selected("chat")}`} onClick={this.setSelected.bind(this, "chat")}>Chat</span>
                            <span className={`detail-bar_tab ${selected("activity")}`} onClick={this.setSelected.bind(this, "activity")}>Activity</span>
                        </div>
                    </div>
                    <div className="detail-bar_main">
                        <div className="detail-bar_collapse-icon" onClick={this.setInactive}><Icon type="chevron-right" /></div>
                        { this.state.selected === "chat" && <Chat /> }
                        { this.state.selected === "activity" && <Activity {...activityProps} /> }
                    </div>
                </div>
                <div className="detail-bar_collapsed">
                    <div onClick={this.setSelected.bind(this, "chat")}><Icon type="chat" /></div>
                    <div onClick={this.setSelected.bind(this, "activity")}><Icon type="activity" /></div>
                </div>
            </div>
        );
    }
}

export default DetailBar;
