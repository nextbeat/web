import React from 'react'
import { connect } from 'react-redux'

import { promptModal, updateChatMessage, sendComment } from '../../../actions'

class Compose extends React.Component {

    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleLoginClick = this.handleLoginClick.bind(this);

        this.renderChat = this.renderChat.bind(this);
    }

    handleChange(e) {
        this.props.dispatch(updateChatMessage(e.target.value))
    }

    handleSubmit(e) {
        const { user, stack, dispatch } = this.props
        dispatch(sendComment(stack.get('chatMessage')))
        if (user.isLoggedIn()) {
            // If the user isn't logged in, they will be prompted to do so
            // during the sendComment action. We don't want to clear the
            // text box in this case.
            dispatch(updateChatMessage(''))
        }
    }

    handleKeyPress(e) {
        if (e.charCode === 13 && !e.shiftKey) { // Enter
            e.preventDefault();
            this.handleSubmit();
        }
    }

    handleLoginClick(e) {
        e.preventDefault();
        this.props.dispatch(promptModal('login'))
    }

    renderChat() {
        const message = this.props.stack.get('chatMessage', '')
        return (
            <div className="chat_compose-inner">
                <textarea onChange={this.handleChange} onKeyPress={this.handleKeyPress} placeholder="Send a message" value={message}></textarea>
                <input type="submit" className="btn" value="Send" disabled={message.length === 0} onClick={this.handleSubmit} />
            </div>
        )
    }

    render() {
        return (
            <div className="chat_compose">
            { this.renderChat() }
            </div>
        );
    }
}

export default connect()(Compose);
