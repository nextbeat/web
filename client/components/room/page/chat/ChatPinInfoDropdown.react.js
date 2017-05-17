import React from 'react'
import Dropdown from '../../../shared/Dropdown.react'

class ChatPinInfoDropdown extends React.Component {

    render() {
        return (
            <Dropdown type="chat-pin-info" style="info" triangleMargin={160} triangleOnBottom={true} {...this.props} >
                <p>You can now <strong>pin</strong> chat messages! Pinned messages will appear at the top of the chat for everyone to see.</p>
            </Dropdown>
        )
    }

}

export default ChatPinInfoDropdown