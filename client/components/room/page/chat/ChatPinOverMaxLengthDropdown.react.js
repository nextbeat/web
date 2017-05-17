import React from 'react'
import Dropdown from '../../../shared/Dropdown.react'

class ChatPinOverMaxLengthDropdown extends React.Component {

    render() {
        const { maxLength } = this.props
        return (
            <Dropdown type="chat-pin-over-max-length" style="info" triangleMargin={10} triangleOnBottom={true} {...this.props} >
                <p>Your pinned message must be {maxLength} characters or less.</p>
            </Dropdown>
        )
    }

}

export default ChatPinOverMaxLengthDropdown