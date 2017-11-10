import * as React from 'react'
import { connect } from 'react-redux'

import SmallFixedChatHistory from '@components/room/chat/SmallFixedChatHistory'

import { selectDetailSection } from '@actions/pages/room'
import RoomPage from '@models/state/pages/room'
import App from '@models/state/app'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    isMobile: boolean
    roomId: number
}

type Props = ConnectProps & DispatchProps

class SmallChat extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.handleChatClick = this.handleChatClick.bind(this)
        this.handleExpandClick = this.handleExpandClick.bind(this)
    }

    handleChatClick() {
        const { isMobile, dispatch } = this.props 
        if (isMobile) {
            dispatch(selectDetailSection('chat'))
        }
    }

    handleExpandClick() {
        this.props.dispatch(selectDetailSection('chat'))
    }

    render() {
        const { roomId } = this.props;
        return (
        <div className="player_small-chat" onClick={this.handleChatClick}>
            <SmallFixedChatHistory roomId={roomId} />
            <div className="player_small-chat_expand">
                <div className="player_small-chat_expand-prompt" onClick={this.handleExpandClick}>Tap to chat</div>
            </div>
        </div>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isMobile: App.isMobile(state),
        roomId: RoomPage.get(state, 'id')
    }
}

export default connect(mapStateToProps)(SmallChat);
