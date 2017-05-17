import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Dropdown from '../../../shared/Dropdown.react'
import { RoomPage } from '../../../../models'
import { promptModal } from '../../../../actions'

class ChatInfoDropdown extends React.Component {

    render() {
        const { username } = this.props
        return (
            <Dropdown type="chat-info" style="info" triangleMargin={10} shouldForceClose={true} triangleOnBottom={true} {...this.props} >
                <p><strong>Chat with {username}</strong> and other people hanging out in the room!</p>
                <p>To <strong>@-mention</strong> someone, tap their username then tap "Mention".</p>
            </Dropdown>
        )
    }

}

export default ChatInfoDropdown