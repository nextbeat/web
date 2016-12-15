import React from 'react'
import { connect } from 'react-redux'

import { promptModal, updateChatMessage, sendComment, didUseChat } from '../../../../actions'
import { CurrentUser, RoomPage } from '../../../../models'

class Compose extends React.Component {

    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleLoginClick = this.handleLoginClick.bind(this);
    }

    handleChange(e) {
        this.props.dispatch(updateChatMessage(e.target.value))
    }

    handleFocus(e) {
        this.props.dispatch(didUseChat())
    }

    handleSubmit(e) {
        const { currentUser, roomPage, dispatch } = this.props
        dispatch(sendComment(roomPage.get('id'), roomPage.get('chatMessage')))
        if (currentUser.isLoggedIn()) {
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


    render() {
        const message = this.props.roomPage.get('chatMessage', '')
        return (
            <div className="chat_compose">
                <div className="chat_compose-inner">
                    <textarea onChange={this.handleChange} onFocus={this.handleFocus} onKeyPress={this.handleKeyPress} placeholder="Send a message" value={message}></textarea>
                    <input type="submit" className="btn" value="Send" disabled={message.length === 0} onClick={this.handleSubmit} />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: new CurrentUser(state),
        roomPage: new RoomPage(state)
    }
}

export default connect(mapStateToProps)(Compose);
