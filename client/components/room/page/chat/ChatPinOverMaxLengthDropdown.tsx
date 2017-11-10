import * as React from 'react'
import Dropdown from '@components/shared/Dropdown'

interface Props {
    maxLength: number
}

class ChatPinOverMaxLengthDropdown extends React.Component<Props> {

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