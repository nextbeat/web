import React from 'react'
import { connect } from 'react-redux'
import ScrollComponent from '../../utils/ScrollComponent.react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import ChatItem from './ChatItem.react'
import LiveChatItem from './LiveChatItem.react'
import NotificationChatItem from './NotificationChatItem.react'
import ChatbotChatItem from './ChatbotChatItem.react'
import Spinner from '../../shared/Spinner.react'

import { loadComments, promptChatActionsForUser } from '../../../actions'
import { Stack, CurrentUser, App } from '../../../models'

function scrollComponentId(props) {
    return `history-${props.room.id}-${props.scrollable ? 'scroll' : 'no-scroll'}`
}

class ChatHistory extends React.Component {

    constructor(props) {
        super(props);

        this.handleSelectUsername = this.handleSelectUsername.bind(this)
        this.renderComment = this.renderComment.bind(this);
    }

    componentDidMount() {

        if (this.props.scrollable) {
            // Prevents document from scrolling when inside chat history element
            // Sourced from http://stackoverflow.com/a/20520619
            $(`#${scrollComponentId(this.props)}`).on('mousewheel DOMMouseScroll', function(e) {
                var direction = e.originalEvent.wheelDelta || -e.originalEvent.detail;
                if ((direction > 0 && this.scrollTop === 0
                    || direction <= 0 && this.scrollTop == this.scrollHeight-this.offsetHeight)
                    && this.scrollHeight > this.offsetHeight)
                {
                    e.preventDefault();
                }
            })
        }

    }

    componentWillUnmount() {
         $(`#${scrollComponentId(this.props)}`).off('mousewheel DOMMouseScroll')

    }

    // Events

    handleSelectUsername(username) {
        this.props.dispatch(promptChatActionsForUser(username))
    }

    // Render

    renderComment(comment, idx) {
        const { room, collapseMessages } = this.props;
        const username = comment.author().get('username')
        const isCreator = comment.authorIsCreator()
        let shouldCollapse = collapseMessages && idx > room.totalCommentsCount() - 5;

        if (comment.get('type') === 'message') {
            return <ChatItem 
                        key={comment.get('id')} 
                        comment={comment} 
                        username={username} 
                        isCreator={isCreator} 
                        handleSelectUsername={this.handleSelectUsername}
                        collapsed={shouldCollapse}
                    />
        } else if (comment.get('type') === 'notification') {
            return <NotificationChatItem 
                        key={comment.get('id')} 
                        comment={comment} 
                        username={username} 
                        room={room}
                    />
        } else {
            return null;
        }
    }

    renderLiveComment(comment, idx) {
        const { room, collapseMessages } = this.props;
        const key = `l${idx}`;
        const isCreator = (room.author().get('username') === comment.get('username'));
        let shouldCollapse = collapseMessages && idx + room.comments().size > room.totalCommentsCount() - 5;

        if (comment.get('type') === 'message') {
            return <LiveChatItem 
                        key={key} 
                        comment={comment} 
                        isCreator={isCreator} 
                        handleSelectUsername={this.handleSelectUsername}
                        collapsed={shouldCollapse}
                    />
        } else if (comment.get('type') === 'notification') {
            return <NotificationChatItem 
                        key={key} 
                        comment={comment} 
                        username={comment.get('username')} 
                        room={room}
                    />
        } else if (comment.get('type') === 'chatbot') {
            return <ChatbotChatItem
                        key={key}
                        message={comment.get('message')}
                    />
        } else {
            return null;
        }
    }

    render() {
        const { room, scrollable, style } = this.props;

        let scrollableClass = scrollable ? 'scrollable': ''
        let styleClass = `chat_history-${style}`

        return (
            <div id={scrollComponentId(this.props)} className={`chat_history ${scrollableClass} ${styleClass}`}>
                { room.get('commentsFetching') && <Spinner type="grey" />}
                { room.get('commentsError') && room.get('commentsError').length > 0 && <p>Could not load comments.</p>}
                <ul className="chat_items">
                    {room.comments().reverse().map((comment, idx) => this.renderComment(comment, idx))}
                    {room.liveComments().map((comment, idx) => this.renderLiveComment(comment, idx))}
                </ul>
            </div>
        );
    }
}

ChatHistory.propTypes = {
    room: React.PropTypes.object.isRequired,
    scrollable: React.PropTypes.bool.isRequired,
    style: React.PropTypes.string.isRequired,
    collapseMessages: React.PropTypes.bool.isRequired
}

ChatHistory.defaultProps = {
    scrollable: true,
    style: 'expanded',
    collapseMessages: false
}

const scrollOptions = {

    onScrollToTop: function(scrollComponent) {
        const { room, dispatch } = this.props
        if (!room.get('commentsFetching') && room.get('id')) {
            dispatch(loadComments(room.get('id')))
        }
    },

    onComponentDidMount: function(scrollComponent, props) {
        if (!props.scrollable) {
            scrollComponent.scrollToBottom();
        }
    },

    onComponentDidUpdate: function(scrollComponent, prevProps) {
        if (prevProps.room.comments().size !== this.props.room.comments().size) {
            console.log('scrolling to bottom')
            scrollComponent.keepScrollPosition()
            scrollComponent.scrollToBottomIfPreviouslyAtBottom()
            scrollComponent.setScrollState()
        }
        if (prevProps.room.liveComments().size !== this.props.room.liveComments().size) {
            scrollComponent.scrollToBottomIfPreviouslyAtBottom()
            scrollComponent.setScrollState()
        }
    },

    onResize: function(scrollComponent, props) {
        if (!props.scrollable) {
            // want to always keep static chat history at bottom of element
            scrollComponent.scrollToBottom();
        }
    }

}

export default connect()(ScrollComponent(scrollComponentId, scrollOptions)(ChatHistory));
