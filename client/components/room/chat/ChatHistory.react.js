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
import { Room, CurrentUser, App } from '../../../models'

function scrollComponentId(props) {
    return `history-${props.roomId}-${props.scrollable ? 'scroll' : 'no-scroll'}`
}

class ChatHistory extends React.Component {

    constructor(props) {
        super(props);

        this.handleSelectUsername = this.handleSelectUsername.bind(this)

        this.renderComment = this.renderComment.bind(this)
        this.renderLiveComment = this.renderLiveComment.bind(this)
        this.renderSubmittingComment = this.renderSubmittingComment.bind(this)
        this.renderFailedComment = this.renderFailedComment.bind(this)
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
        const { collapseMessages, totalCommentsCount, roomId } = this.props;
        const username = comment.author().get('username')
        const isCreator = comment.authorIsCreator()
        let shouldCollapse = collapseMessages && idx > totalCommentsCount - 5;

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
                        roomId={roomId}
                    />
        } else if (comment.get('type') === 'chatbot') {
            return <ChatbotChatItem
                        key={comment.get('id')}
                        message={comment.get('message')}
                    />
            return null;
        }
    }

    renderLiveComment(comment, idx) {
        const { authorUsername, comments, totalCommentsCount, collapseMessages, roomId } = this.props;
        const key = `l${idx}`;
        const isCreator = (authorUsername === comment.get('username'));
        let shouldCollapse = collapseMessages && idx + comments.size > totalCommentsCount - 5;

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
                        roomId={roomId}
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

    renderSubmittingComment(comment, idx) {
        const { authorUsername } = this.props;
        const key = `s${idx}`
        const isCreator = (authorUsername === comment.get('username'));
        return <LiveChatItem
                key={key}
                comment={comment}
                isCreator={isCreator} 
                handleSelectUsername={this.handleSelectUsername}
                collapsed={false}
                type="submitting"
            />
    }

    renderFailedComment(comment, idx) {
        const { authorUsername } = this.props;
        const key = `s${idx}`
        const isCreator = (authorUsername === comment.get('username'));
        return <LiveChatItem
                key={key}
                comment={comment}
                isCreator={isCreator} 
                handleSelectUsername={this.handleSelectUsername}
                collapsed={false}
                type="failed"
            />
    }

    render() {
        const { comments, liveComments, submittingComments, failedComments, 
                commentsFetching, commentsError, scrollable, style } = this.props;

        let scrollableClass = scrollable ? 'scrollable': ''
        let styleClass = `chat_history-${style}`

        return (
            <div id={scrollComponentId(this.props)} className={`chat_history ${scrollableClass} ${styleClass}`}>
                { commentsFetching && <Spinner type="grey" />}
                { commentsError && commentsError.length > 0 && <p>Could not load comments.</p>}
                <ul className="chat_items">
                    {comments.reverse().map((comment, idx) => this.renderComment(comment, idx))}
                    {liveComments.map((comment, idx) => this.renderLiveComment(comment, idx))}
                    { style === "expanded" &&
                        [
                        submittingComments.map((comment, idx) => this.renderSubmittingComment(comment, idx)),
                        failedComments.map((comment, idx) => this.renderFailedComment(comment, idx))
                        ]
                    }
                </ul>
            </div>
        );
    }
}

ChatHistory.propTypes = {
    roomId: React.PropTypes.number.isRequired,
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
        const { roomId, commentsFetching, dispatch } = this.props
        if (commentsFetching && roomId) {
            dispatch(loadComments(roomId))
        }
    },

    onComponentDidMount: function(scrollComponent, props) {
        if (!props.scrollable) {
            scrollComponent.scrollToBottom();
        }
    },

    onComponentDidUpdate: function(scrollComponent, prevProps) {
        if (prevProps.comments.size !== this.props.comments.size) {
            scrollComponent.keepScrollPosition()
            scrollComponent.scrollToBottomIfPreviouslyAtBottom()
            scrollComponent.setScrollState()
        }
        if (prevProps.liveComments.size !== this.props.liveComments.size) {
            scrollComponent.scrollToBottomIfPreviouslyAtBottom()
            scrollComponent.setScrollState()
        }
        if (prevProps.submittingComments.size !== this.props.submittingComments.size) {
            scrollComponent.scrollToBottomIfPreviouslyAtBottom()
            scrollComponent.setScrollState()
        }
        if (prevProps.failedComments.size !== this.props.failedComments.size) {
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

function mapStateToProps(state, ownProps) {
    let room = new Room(ownProps.roomId, state)
    return {
        authorUsername: room.author().get('username'),

        comments: room.comments(),
        liveComments: room.liveComments(),
        submittingComments: room.submittingComments(),
        failedComments: room.failedComments(),
        totalCommentsCount: room.totalCommentsCount(),

        commentsFetching: room.get('commentsFetching'),
        commentsError: room.get('commentsError'),
    }
}

export default connect(mapStateToProps)(ScrollComponent(scrollComponentId, scrollOptions)(ChatHistory));
