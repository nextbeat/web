import React from 'react'
import { connect } from 'react-redux'

import ChatInfoDropdown from './ChatInfoDropdown.react'
import { promptModal, updateChatMessage, sendComment, didUseChat, promptDropdown, closeDropdown } from '../../../../actions'
import { CurrentUser, RoomPage } from '../../../../models'
import { storageAvailable } from '../../../../utils'

class Compose extends React.Component {

    constructor(props) {
        super(props);

        this.shouldPromptDropdown = this.shouldPromptDropdown.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleLoginClick = this.handleLoginClick.bind(this);
        this.handleChatInfoDropdownClose = this.handleChatInfoDropdownClose.bind(this);
    }

    shouldPromptDropdown() {
        const { currentUser } = this.props 
        return currentUser.isLoggedIn() && storageAvailable('localStorage') && !JSON.parse(localStorage.getItem('hideChatInfoDropdown')) 
    }

    handleChange(e) {
        this.props.dispatch(updateChatMessage(e.target.value))
    }

    handleFocus(e) {
        const { dispatch, currentUser } = this.props
        dispatch(didUseChat())
        if (this.shouldPromptDropdown()) {
            dispatch(promptDropdown('chat-info'))
        } 
    }

    handleSubmit(e) {
        const { currentUser, roomPage, dispatch } = this.props
        dispatch(sendComment(roomPage.get('id'), roomPage.get('chatMessage')))
        if (currentUser.isLoggedIn()) {
            this.handleChatInfoDropdownClose()
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

    handleChatInfoDropdownClose() {
        if (storageAvailable('localStorage')) {
            localStorage.setItem('hideChatInfoDropdown', true)
        }
        this.props.dispatch(closeDropdown('chat-info'))
    }

    render() {
        const { roomPage } = this.props
        const message = roomPage.get('chatMessage', '')
        return (
            <div className="chat_compose">
                <ChatInfoDropdown username={roomPage.author().get('username')} handleClose={this.handleChatInfoDropdownClose} />
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
