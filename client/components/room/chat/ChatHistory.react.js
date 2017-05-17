import React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'
import ScrollComponent from '../../utils/ScrollComponent.react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import ChatItem from './ChatItem.react'
import NotificationChatItem from './NotificationChatItem.react'
import Spinner from '../../shared/Spinner.react'

import { loadComments, promptChatActionsForUser, resendComment } from '../../../actions'
import { Room, CurrentUser, App } from '../../../models'

function scrollComponentId(props) {
    return `history-${props.roomId}-${props.scrollable ? 'scroll' : 'no-scroll'}`
}

function commentCollapser(res, comment) {
    let isCollapsibleComment = (comment) => comment.get('type') === 'notification' && comment.get('subtype') === 'mediaitem';
    
    if (res.last() && isCollapsibleComment(res.last()) && isCollapsibleComment(comment)) {
        // collapse into previous notification comment
        let count = res.last().__count__;
        comment.__count__ = count+1;
        return res.pop().push(comment);
    } 

    if (isCollapsibleComment(comment)) {
        comment.__count__ = 1;
    }

    return res.push(comment);
}

class ChatHistory extends React.Component {

    constructor(props) {
        super(props);

        this.handleSelectUsername = this.handleSelectUsername.bind(this)
        this.handleResend = this.handleResend.bind(this)

        this.renderComment = this.renderComment.bind(this)
        this.renderLiveComment = this.renderLiveComment.bind(this)
        this.renderSubmittingComment = this.renderSubmittingComment.bind(this)
        this.renderFailedComment = this.renderFailedComment.bind(this)

        this.state = {
            hasUnseenLiveMessages: false
        }
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

    handleResend(comment) {
        const { dispatch, roomId } = this.props
        dispatch(resendComment(roomId, comment))
    }

    // Render

    renderComment(comment, idx) {
        const { authorUsername, collapseMessages, totalCommentsCount, roomId } = this.props;
        const isCreator = comment.author().get('username') === authorUsername;
        let shouldCollapse = collapseMessages && idx > totalCommentsCount - 5;

        if (comment.get('type') === 'message') {
            return <ChatItem 
                        key={comment.get('id')} 
                        comment={comment}
                        isCreator={isCreator} 
                        handleSelectUsername={this.handleSelectUsername}
                        collapsed={shouldCollapse}
                    />
        } else if (comment.get('type') === 'notification') {
            return <NotificationChatItem 
                        key={comment.get('id')} 
                        roomId={roomId}
                        comment={comment} 
                        username={authorUsername}
                        count={comment.__count__}
                    />
        }
    }

    renderLiveComment(comment, idx) {
        const { authorUsername, comments, totalCommentsCount, collapseMessages, roomId } = this.props;
        const key = `l${idx}`;
        const isCreator = (authorUsername === comment.author().get('username'));
        let shouldCollapse = collapseMessages && idx + comments.size > totalCommentsCount - 5;

        if (comment.get('type') === 'message') {
            return <ChatItem 
                        key={key} 
                        comment={comment} 
                        isCreator={isCreator} 
                        handleSelectUsername={this.handleSelectUsername}
                        collapsed={shouldCollapse}
                    />
        } else if (comment.get('type') === 'notification') {
            return <NotificationChatItem 
                        key={key} 
                        roomId={roomId}
                        comment={comment} 
                        username={authorUsername}
                        count={comment.__count__}
                    />
        } else {
            return null;
        }
    }

    renderSubmittingComment(comment, idx) {
        const { authorUsername } = this.props;
        const key = `s${idx}`
        const isCreator = (authorUsername === comment.get('username'));
        return <ChatItem
                key={key}
                comment={comment}
                isCreator={isCreator} 
                handleSelectUsername={this.handleSelectUsername}
                collapsed={false}
                submitStatus="submitting"
            />
    }

    renderFailedComment(comment, idx) {
        const { authorUsername } = this.props;
        const key = `s${idx}`
        const isCreator = (authorUsername === comment.get('username'));
        return <ChatItem
                key={key}
                comment={comment}
                isCreator={isCreator} 
                handleSelectUsername={this.handleSelectUsername}
                handleResend={this.handleResend}
                collapsed={false}
                submitStatus="failed"
            />
    }

    render() {
        const { comments, liveComments, submittingComments, failedComments,
                commentsFetching, commentsError, scrollable, style,
                scrollToBottom } = this.props;

        const { hasUnseenLiveMessages } = this.state;

        let scrollableClass = scrollable ? 'scrollable': ''
        let styleClass = `chat_history-${style}`

        return (
            <div className="chat_history_container">
                <div id={scrollComponentId(this.props)} className={`chat_history ${scrollableClass} ${styleClass}`}>
                    { commentsFetching && <Spinner type="grey" />}
                    <ul className="chat_items">
                        {comments.reverse().reduce(commentCollapser, List()).map((comment, idx) => this.renderComment(comment, idx))}
                        {liveComments.reduce(commentCollapser, List()).map((comment, idx) => this.renderLiveComment(comment, idx))}
                        { style === "expanded" &&
                            [
                            submittingComments.map((comment, idx) => this.renderSubmittingComment(comment, idx)),
                            failedComments.map((comment, idx) => this.renderFailedComment(comment, idx))
                            ]
                        }
                    </ul>
                </div>
                { hasUnseenLiveMessages && 
                    <div className="chat_history_new-messages" onClick={() => scrollToBottom(100)}>
                        New messages below
                    </div>
                }
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
        if (!commentsFetching && roomId) {
            dispatch(loadComments(roomId))
        }
    },

    onScrollToBottom: function() {
        this.setState({ hasUnseenLiveMessages: false });
    },

    onComponentDidMount: function(scrollComponent, props) {
        if (!props.scrollable) {
            scrollComponent.scrollToBottom();
        }
    },

    onComponentDidUpdate: function(scrollComponent, prevProps) {
        function conditionalScrollToBottom() {
            if (prevProps.scrollable) {
                scrollComponent.scrollToBottomIfPreviouslyAtBottom()
            } else {
                scrollComponent.scrollToBottom()
            }
        }

        if (prevProps.comments.size < this.props.comments.size) {
            scrollComponent.keepScrollPosition()
            scrollComponent.scrollToBottomIfPreviouslyAtBottom()
        }
        if (prevProps.submittingComments.size < this.props.submittingComments.size) {
            scrollComponent.scrollToBottom()
        }
        if (prevProps.failedComments.size < this.props.failedComments.size) {
            conditionalScrollToBottom()
        }
        if (prevProps.liveComments.size < this.props.liveComments.size) {
            // for some reason, on mobile browsers the dom doesn't properly 
            // update until the next cycle
            process.nextTick(() => {
                let lastComment = this.props.liveComments.last()
                if (this.props.scrollable && !lastComment.has('temporaryId')) {
                    // we want to ignore user-submitted comments
                    if (!scrollComponent.isScrolledToBottom()) {
                        this.setState({ hasUnseenLiveMessages: true })
                    }
                }
                conditionalScrollToBottom()
            })
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
