import React from 'react'
import { connect } from 'react-redux'

import ChatHistory from '../../chat/ChatHistory.react'

import { RoomPage, App } from '../../../../models'
import { selectDetailSection } from '../../../../actions'

class SmallChat extends React.Component {

    constructor(props) {
        super(props);

        this.handleChatClick = this.handleChatClick.bind(this)
        this.handleExpandClick = this.handleExpandClick.bind(this)
    }

    handleChatClick() {
        const { app, dispatch } = this.props 
        if (app.isMobile()) {
            dispatch(selectDetailSection('chat'))
        }
    }

    handleExpandClick() {
        this.props.dispatch(selectDetailSection('chat'))
    }

    render() {
        const { roomPage } = this.props;
        return (
        <div className="player_small-chat" onClick={this.handleChatClick}>
            <ChatHistory room={roomPage.room()} scrollable={false} style='compact' collapseMessages={true} />
            <div className="player_small-chat_expand">
                <div className="player_small-chat_expand-prompt" onClick={this.handleExpandClick}>Tap to chat</div>
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
