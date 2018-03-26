import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'
import * as TransitionGroup from 'react-transition-group/TransitionGroup'
import * as CSSTransition from 'react-transition-group/CSSTransition'

import ChatInfoDropdown from './ChatInfoDropdown'
import ChatPinInfoDropdown from './ChatPinInfoDropdown'
import ChatPinOverMaxLengthDropdown from './ChatPinOverMaxLengthDropdown'
import Checkbox from '@components/shared/Checkbox'
import Icon from '@components/shared/Icon'

import { sendComment, pinComment, didUseChat } from '@actions/room'
import { searchChat } from '@actions/pages/room'
import { promptModal, promptDropdown, closeDropdown } from '@actions/app'
import { clearChatMessage } from '@actions/pages/room'
import CurrentUser from '@models/state/currentUser'
import RoomPage from '@models/state/pages/room'
import Room from '@models/state/room'
import { storageAvailable } from '@utils'
import { State, DispatchProps } from '@types'

function length(message: string) {
    return message.trim().length
}

const MAX_MESSAGE_LENGTH = 120

interface ConnectProps {
    roomId: number
    mentions: List<string>
    authorUsername: string
    isCurrentUserAuthor: boolean
    chatTags: List<string>
    isLoggedIn: boolean
}

type Props = ConnectProps & DispatchProps

interface ComposeState {
    message: string
    isPinned: boolean
}

class Compose extends React.Component<Props, ComposeState> {

    private _textarea: HTMLTextAreaElement

    constructor(props: Props) {
        super(props);

        this.shouldPromptChatInfoDropdown = this.shouldPromptChatInfoDropdown.bind(this);
        this.shouldPromptChatPinInfoDropdown = this.shouldPromptChatPinInfoDropdown.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handlePinnedChange = this.handlePinnedChange.bind(this);
        this.handleChatInfoDropdownClose = this.handleChatInfoDropdownClose.bind(this);
        this.handleChatPinInfoDropdownClose = this.handleChatPinInfoDropdownClose.bind(this);

        this.renderPinControl = this.renderPinControl.bind(this);

        // We're using state here instead of going through
        // Redux (which would be the more canonical
        // implementation) for performance reasons
        this.state = {
            message: '',
            isPinned: false
        };
    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.mentions.size > this.props.mentions.size) {
            let message = this.state.message
            let username = nextProps.mentions.last() as string
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
        const { isLoggedIn } = this.props 
        return isLoggedIn && storageAvailable('localStorage') && !JSON.parse(localStorage.getItem('hideChatInfoDropdown') || 'false') 
    }

    shouldPromptChatPinInfoDropdown() {
        return storageAvailable('localStorage') && !JSON.parse(localStorage.getItem('hideChatPinInfoDropdown') || 'false') 
    }

    handleChange(e: React.FormEvent<HTMLTextAreaElement>) {
        this.setState({ message: e.currentTarget.value })
    }

    handlePinnedChange(checked: boolean) {
        if (checked && this.shouldPromptChatPinInfoDropdown()) {
            this.props.dispatch(promptDropdown('chat-pin-info'))
        }
        this.setState({ isPinned: checked })
    }

    handleFocus(e: React.FocusEvent<HTMLTextAreaElement>) {
        const { dispatch } = this.props
        dispatch(didUseChat())
        if (this.shouldPromptChatInfoDropdown()) {
            dispatch(promptDropdown('chat-info'))
        } 
    }

    handleSubmit() {
        const { roomId, isLoggedIn, dispatch } = this.props
        const { isPinned, message } = this.state 

        if (isPinned) {
            if (length(message) > MAX_MESSAGE_LENGTH) {
                dispatch(promptDropdown('chat-pin-over-max-length'))
                return;
            } else {
                dispatch(pinComment(roomId, message))
                this.setState({ isPinned: false })
            }
        } else {
            dispatch(sendComment(roomId, message))
        }

        if (isLoggedIn) {
            this.handleChatInfoDropdownClose()
            // If the user isn't logged in, they will be prompted to do so
            // during the sendChat action. We don't want to clear the
            // text box in this case.
            this.setState({ message: '' })
            dispatch(clearChatMessage())
        }

        // keep focus on textarea so that keyboard doesn't dismiss on mobile
        this._textarea.focus()
    }

    handleKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.charCode === 13 && !e.shiftKey) { // Enter
            e.preventDefault();
            this.handleSubmit();
        }
    }

    handleChatInfoDropdownClose() {
        if (storageAvailable('localStorage')) {
            localStorage.setItem('hideChatInfoDropdown', 'true')
        }
        this.props.dispatch(closeDropdown('chat-info'))
    }

    handleChatPinInfoDropdownClose() {
        if (storageAvailable('localStorage')) {
            localStorage.setItem('hideChatPinInfoDropdown', 'true')
        }
        this.props.dispatch(closeDropdown('chat-pin-info'))
    }

    renderPinControl() {
        const { message, isPinned } = this.state 
        return (
            <div className="chat_compose_pin">
                <Checkbox checked={isPinned} onChange={this.handlePinnedChange} label="Pin" />
                <div className="chat_compose_pin_counter_container">
                    <TransitionGroup>
                        { isPinned && 
                            <CSSTransition classNames="chat_compose_pin_counter" timeout={150}>
                                <div className="chat_compose_pin_counter">
                                    <span className={length(message) > MAX_MESSAGE_LENGTH ? 'chat_compose_pin_counter-over-max' : ''}>{length(message)}</span>/{MAX_MESSAGE_LENGTH}
                                </div>
                            </CSSTransition>
                        }
                    </TransitionGroup>
                </div>
            </div>
        )
    }

    renderTag(tag: string) {
        const { dispatch } = this.props
        let handleClick = () => {
            dispatch(searchChat(tag, true))
        }
        return (
            <div onClick={handleClick} className="chat_tag" key={tag}>{tag}</div>
        )
    }

    renderTags() {
        const { chatTags } = this.props

        if (chatTags.size === 0 ) {
            return null;
        }

        return (
            <div className="chat_tags">
                <Icon type="whatshot" />
                <div className="chat_tags_list">
                    { chatTags.map(tag => this.renderTag(tag)) }
                </div>
            </div>
        )
    }

    render() {
        const { authorUsername, isCurrentUserAuthor } = this.props
        const { message, isPinned } = this.state
        return (
            <div className="chat_compose">
                <ChatInfoDropdown username={authorUsername} handleClose={this.handleChatInfoDropdownClose} />
                <ChatPinInfoDropdown handleClose={this.handleChatPinInfoDropdownClose} />
                <ChatPinOverMaxLengthDropdown maxLength={MAX_MESSAGE_LENGTH} />
                <div className="chat_compose-inner">
                    { this.renderTags() }
                    <textarea ref={ (c) => { if (c) { this._textarea = c } }} onChange={this.handleChange} onFocus={this.handleFocus} onKeyPress={this.handleKeyPress} placeholder="Send a message" value={message}></textarea>
                    <div className="chat_compose_controls">
                        <input type="submit" 
                           className={`chat_compose_submit btn ${isPinned && length(message) > MAX_MESSAGE_LENGTH ? 'chat_compose_submit-over-max' : ''}`} 
                           value="Send" 
                           disabled={length(message) === 0} 
                           onClick={this.handleSubmit} 
                        />
                        { isCurrentUserAuthor && this.renderPinControl() }
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        roomId: RoomPage.get(state, 'id'),
        mentions: RoomPage.get(state, 'mentions', List()),
        authorUsername: RoomPage.entity(state).author().get('username'),
        isCurrentUserAuthor: RoomPage.isCurrentUserAuthor(state),
        chatTags: Room.get(state, RoomPage.get(state, 'id'), 'chatTags', List()),

        isLoggedIn: CurrentUser.isLoggedIn(state)
    }
}

export default connect(mapStateToProps)(Compose);
