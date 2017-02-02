import React from 'react'
import { connect } from 'react-redux'

import ChatHistory from '../../chat/ChatHistory.react'

import { RoomPage, App } from '../../../../models'

class SmallChat extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { roomPage } = this.props;
        return (
        <div className="player_small-chat">
            <ChatHistory room={roomPage.room()} scrollable={false} style='compact' collapseMessages={true} />
            <div className="player_small-chat_expand">
                <div className="player_small-chat_expand-prompt">Tap to chat</div>
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

export default connect(mapStateToProps)(SmallChat);
