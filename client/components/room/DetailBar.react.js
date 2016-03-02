import React from 'react'

import Chat from './chat/Chat.react'
import Activity from './activity/Activity.react'

class DetailBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selected: "chat"
        }
    }

    setSelected(selected) {
        this.setState({ selected })
    }

    render() {
        const selected = type => this.state.selected === type ? "selected" : "";
        const { stack, handleSelectMediaItem, handleSelectNewestLiveItem  } = this.props;
        const activityProps = {
            mediaItems: stack.mediaItems(),
            liveMediaItems: stack.liveMediaItems(),
            selectedItem: stack.selectedMediaItem(),
            handleSelectMediaItem,
            handleSelectNewestLiveItem
        }
        return (
            <div className="detail-bar">
                <div className="detail-bar_header">
                    <div className="detail-bar_tab-container">
                        <span className={`detail-bar_tab ${selected("chat")}`} onClick={this.setSelected.bind(this, "chat")}>Chat</span>
                        <span className={`detail-bar_tab ${selected("activity")}`} onClick={this.setSelected.bind(this, "activity")}>Activity</span>
                    </div>
                </div>
                <div className="detail-bar_main">
                { this.state.selected === "chat" && <Chat /> }
                { this.state.selected === "activity" && <Activity {...activityProps} /> }
                </div>
            </div>
        );
    }
}

export default DetailBar;
