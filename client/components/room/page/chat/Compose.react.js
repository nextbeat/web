import React from 'react'
import { connect } from 'react-redux'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { List } from 'immutable'

import ChatInfoDropdown from './ChatInfoDropdown.react'
import ChatPinOverMaxLengthDropdown from './ChatPinOverMaxLengthDropdown.react'
import Checkbox from '../../../shared/Checkbox.react'

import { promptModal, clearChatMessage, sendComment, pinComment,
         didUseChat, promptDropdown, closeDropdown } from '../../../../actions'
import { CurrentUser, RoomPage } from '../../../../models'
import { storageAvailable } from '../../../../utils'

function length(message) {
    return message.trim().length
}

const MAX_MESSAGE_LENGTH = 120

class Compose extends React.Component {

    constructor(props) {
        super(props);

        this.shouldPromptChatInfoDropdown = this.shouldPromptChatInfoDropdown.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handlePinnedChange = this.handlePinnedChange.bind(this);
        this.handleLoginClick = this.handleLoginClick.bind(this);
        this.handleChatInfoDropdownClose = this.handleChatInfoDropdownClose.bind(this);

        // We're using state here instead of going through
        // Redux (which would be the more canonical
        // implementation) for performance reasons
        this.state = {
            message: '',
            isPinned: false
        };
    }

    componentWillReceiveProps(nextProps) {
        let mentions = (props) => props.roomPage.get('mentions', List())
        if (mentions(nextProps).size > mentions(this.props).size) {
            let message = this.state.message
            let username = mentions(nextProps).last()
            if (length(message) === 0 || /\s$/.test(message)) {
                // don't add whitespace
                message = `${message}@${username}`
            } else {
                message = `${message} @${username}`
            }
            this.setState({ message })
        }
    }

    shouldPromptChatInfoDropdown() {
        const { currentUser } = this.props 
        return currentUser.isLoggedIn() && storageAvailable('localStorage') && !JSON.parse(localStorage.getItem('hideChatInfoDropdown')) 
    }

    handleChange(e) {
        this.setState({ message: e.target.value })
    }

    handlePinnedChange(checked) {
        this.setState({ isPinned: checked })
    }

    handleFocus(e) {
        const { dispatch, currentUser } = this.props
        dispatch(didUseChat())
        if (this.shouldPromptChatInfoDropdown()) {
            dispatch(promptDropdown('chat-info'))
        } 
    }

    handleSubmit(e) {
        const { currentUser, roomPage, dispatch } = this.props
        const { isPinned, message } = this.state 

        if (isPinned) {
            if (length(message) > MAX_MESSAGE_LENGTH) {
                dispatch(promptDropdown('chat-pin-over-max-length'))
                return;
            } else {
                dispatch(pinComment(roomPage.get('id'), message))
                this.setState({ isPinned: false })
            }
        } else {
            dispatch(sendComment(roomPage.get('id'), message))
        }

        if (currentUser.isLoggedIn()) {
            this.handleChatInfoDropdownClose()
            // If the user isn't logged in, they will be prompted to do so
            // during the sendChat action. We don't want to clear the
            // text box in this case.
            this.setState({ message: '' })
            dispatch(clearChatMessage())
        }

        // keep focus on textarea so that keyboard doesn't dismiss on mobile
        this.refs.textarea.focus()
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
        const { message, isPinned } = this.state
        return (
            <div className="chat_compose">
                <ChatInfoDropdown username={roomPage.author().get('username')} handleClose={this.handleChatInfoDropdownClose} />
                <ChatPinOverMaxLengthDropdown maxLength={MAX_MESSAGE_LENGTH} />
                <div className="chat_compose-inner">
                    <textarea ref="textarea" onChange={this.handleChange} onFocus={this.handleFocus} onKeyPress={this.handleKeyPress} placeholder="Send a message" value={message}></textarea>
                    <div className="chat_compose_controls">
                        <input type="submit" 
                       className={`chat_compose_submit btn ${isPinned && length(message) > MAX_MESSAGE_LENGTH ? 'chat_compose_submit-over-max' : ''}`} 
                           value="Send" 
                           disabled={length(message) === 0} 
                           onClick={this.handleSubmit} 
                        />
                        { roomPage.currentUserIsAuthor() &&
                            <div className="chat_compose_pin">
                                <Checkbox checked={isPinned} onChange={this.handlePinnedChange} label="Pin" />
                                <div className="chat_compose_pin_counter_container">
                                    <ReactCSSTransitionGroup transitionName="chat_compose_pin_counter" transitionEnterTimeout={150} transitionLeaveTimeout={150}>
                                        { isPinned && 
                                            <div className="chat_compose_pin_counter">
                                                <span className={length(message) > MAX_MESSAGE_LENGTH ? 'chat_compose_pin_counter-over-max' : ''}>{length(message)}</span>/{MAX_MESSAGE_LENGTH}
                                            </div>
                                        }
                                    </ReactCSSTransitionGroup>
                                </div>
                            </div>
                        }
                    </div>
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
