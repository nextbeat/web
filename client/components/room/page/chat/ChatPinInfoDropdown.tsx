import * as React from 'react'
import Dropdown from '@components/shared/Dropdown.react'

interface Props {
    handleClose: () => void
}

class ChatPinInfoDropdown extends React.Component<Props> {

    render() {
        return (
            <Dropdown type="chat-pin-info" style="info" triangleMargin={160} triangleOnBottom={true} {...this.props} >
                <p>You can now <strong>pin</strong> chat messages! Pinned messages will appear at the top of the chat for everyone to see.</p>
            </Dropdown>
        )
    }

}

export default ChatPinInfoDropdown