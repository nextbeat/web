import * as React from 'react'
import { connect } from 'react-redux'

import ScrollableChatHistory from '@components/room/chat/ScrollableChatHistory'

import { expandChat } from '@actions/pages/room'
import RoomPage from '@models/state/pages/room'
import App from '@models/state/app'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    roomId: number
}

type Props = ConnectProps & DispatchProps

class SmallChat extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.handleExpandClick = this.handleExpandClick.bind(this)
    }

    handleExpandClick() {
        this.props.dispatch(expandChat())
    }

    render() {
        const { roomId } = this.props;
        return (
        <div className="chat_small">
            <ScrollableChatHistory roomId={roomId} style="small" />
            <div className="chat_small_expand">
                <div className="chat_small_expand-prompt" onClick={this.handleExpandClick}>Tap to chat</div>
            </div>
        </div>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        roomId: RoomPage.get(state, 'id')
    }
}

export default connect(mapStateToProps)(SmallChat);
