import React from 'react'
import { connect } from 'react-redux'
import { List, Set } from 'immutable'
import ScrollComponent from '../../utils/ScrollComponent.react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import ChatItem from './ChatItem.react'
import NotificationChatItem from './NotificationChatItem.react'
import Spinner from '../../shared/Spinner.react'
import commentReducer from './utils/commentReducer'

import { loadComments, loadLatestComments, promptChatActionsForUser, resendComment, selectMediaItem, closeDetailSection, toggleDropdown } from '../../../actions'
import { Room, CurrentUser, App } from '../../../models'

function scrollComponentId(props) {
    return `history-${props.roomId}-scroll`
}

class ScrollableChatHistory extends React.Component {

    constructor(props) {
        super(props);

        this.handleSelectUsername = this.handleSelectUsername.bind(this)
        this.handleSelectMediaItem = this.handleSelectMediaItem.bind(this)
        this.handleSelectChatOptions = this.handleSelectChatOptions.bind(this)

        this.handleResend = this.handleResend.bind(this)
        this.handleRespond = this.handleRespond.bind(this)
        this.handleJumpToPresent = this.handleJumpToPresent.bind(this)

        this.renderComment = this.renderComment.bind(this)

        this.state = {
            inMessageArchive: false,
            hasUnseenLiveMessages: false,
            inScrollToCommentWindow: false
        }
    }

    componentDidMount() {
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

    componentWillUnmount() {
         $(`#${scrollComponentId(this.props)}`).off('mousewheel DOMMouseScroll')
    }

    // Events

    handleSelectUsername(username) {
        this.props.dispatch(promptChatActionsForUser(username))
    }

    handleSelectMediaItem(mediaItemId) {
        const { dispatch, roomId } = this.props
        dispatch(selectMediaItem(roomId, mediaItemId));
        dispatch(closeDetailSection())
    }

    handleSelectChatOptions(chatId) {
        const { dispatch } = this.props
        dispatch(toggleDropdown(`${chatId}-options`))
    }

    handleResend(comment) {
        const { dispatch, roomId } = this.props
        dispatch(resendComment(roomId, comment))
    }

    handleRespond(comment) {
        const { hid } = this.props;
        this.context.router.push({
            pathname: `/r/${hid}/upload/${comment.get('id')}`
        })
    }

    handleJumpToPresent() {
        const { dispatch, roomId } = this.props 
        dispatch(loadLatestComments(roomId))
    }

    // Render

    renderComment(comment, idx) {
        const { roomId, authorUsername, currentUserIsAuthor, activeDropdowns } = this.props;

        const isCreator = comment.author().get('username') === authorUsername;
        const componentId = `comment-${roomId}-${comment.get('id')}`
        const isDropdownActive = activeDropdowns.includes(`${componentId}-options`)

        if (comment.get('type') === 'message') {
            return <ChatItem 
                        id={componentId}
                        key={idx} 
                        comment={comment}
                        isCreator={isCreator} 
                        showHeader={!comment.__no_header__}
                        showOptions={currentUserIsAuthor}
                        handleSelectUsername={this.handleSelectUsername}
                        handleSelectMediaItem={this.handleSelectMediaItem}
                        handleSelectOptions={this.handleSelectChatOptions}
                        handleRespond={this.handleRespond}
                        isDropdownActive={isDropdownActive}
                    />
        } else if (comment.get('type') === 'notification') {
            return <NotificationChatItem 
                        key={idx}
                        roomId={roomId}
                        comment={comment} 
                        username={authorUsername}
                        count={comment.__count__}
                        handleSelectMediaItem={this.handleSelectMediaItem}
                    />
        }
    }

    render() {
        const { comments, liveComments, submittingComments, failedComments,
                commentsFetching, commentsFetchType, hasReachedLatestComment,
                hasLoadedChat, scrollToBottom, dispatch, style } = this.props;

        const { hasUnseenLiveMessages, inMessageArchive } = this.state;

        let styleClass = `chat_history-${style}`

        let commentsList = comments.reverse();
        if (hasReachedLatestComment) {
            commentsList = commentsList.concat(liveComments);
            if (style === "expanded") {
                commentsList = commentsList.concat(submittingComments).concat(failedComments);
            }
        }

        return (
            <div className="chat_history_container">
                {!hasLoadedChat &&
                    <div className="chat_history_overlay">
                        <Spinner type="grey" />
                    </div>
                }
                <div id={scrollComponentId(this.props)} className={`chat_history scrollable ${styleClass}`}>
                    { commentsFetching && commentsFetchType !== 'after' && <Spinner type="grey" />}
                    <ul className="chat_items">
                        { commentsList.reduce(commentReducer, List()).map((comment, idx) => this.renderComment(comment, idx)) }
                    </ul>
                    { commentsFetching && commentsFetchType === 'after' && <Spinner type="grey" />}
                </div>
                { inMessageArchive && 
                    <div className="chat_history_new-messages" onClick={this.handleJumpToPresent}>
                        Jump to present
                    </div>
                }
                { !inMessageArchive && hasUnseenLiveMessages && 
                    <div className="chat_history_new-messages" onClick={() => scrollToBottom(100)}>
                        More messages below
                    </div>
                }
            </div>
        );
    }
}

ScrollableChatHistory.propTypes = {
    roomId: React.PropTypes.number.isRequired,
    style: React.PropTypes.string.isRequired,
}

ScrollableChatHistory.defaultProps = {
    style: 'expanded',
}

ScrollableChatHistory.contextTypes = {
    router: React.PropTypes.object.isRequired
}

const scrollOptions = {

    onScrollToTop: function(scrollComponent) {
        const { roomId, commentsFetching, dispatch } = this.props

        if (!commentsFetching && roomId) {
            dispatch(loadComments(roomId, 'before'))
        }
    },

    onScrollToBottom: function() {
        const { inScrollToCommentWindow } = this.state 
        const { roomId, commentsFetching, hasReachedLatestComment, dispatch } = this.props 

        if (!commentsFetching && !inScrollToCommentWindow && roomId) {
            dispatch(loadComments(roomId, 'after'))
        }

        if (hasReachedLatestComment) {
            this.setState({
                hasUnseenLiveMessages: false,
                inMessageArchive: false
            })
        }
    },

    onComponentDidUpdate: function(scrollComponent, prevProps) {

        if (this.props.commentsFetchType === 'around' && this.props.commentsFetching) {
            this.setState({ inScrollToCommentWindow: true })
        }

        if (this.props.comments.size > 0 && !this.props.hasReachedLatestComment) {
            this.setState({ inMessageArchive: true });
        }

        if (this.props.commentsFetchType === 'mostRecent' && this.props.commentsFetching) {
            this.setState({ inMessageArchive: false });
        }

        if (prevProps.comments.size < this.props.comments.size) {
            if (this.props.commentsFetchType === 'before') {
                scrollComponent.keepScrollPosition()
            } else if (this.props.commentsFetchType === 'around' || this.props.commentsFetchType === 'mostRecent') {
                scrollComponent.scrollToBottom()
            }
        }

        if (prevProps.submittingComments.size < this.props.submittingComments.size) {
            scrollComponent.scrollToBottom()
        }

        if (prevProps.failedComments.size < this.props.failedComments.size) {
           scrollComponent.scrollToBottomIfPreviouslyAtBottom()
        }

        if (prevProps.liveComments.size < this.props.liveComments.size) {
            // for some reason, on mobile browsers the dom doesn't properly 
            // update until the next cycle
            process.nextTick(() => {
                let lastComment = this.props.liveComments.last()
                if (!lastComment.has('temporary_id')) {
                    // we want to ignore user-submitted comments
                    if (!scrollComponent.isScrolledToBottom()) {
                        this.setState({ hasUnseenLiveMessages: true })
                    }
                }
                if (this.props.hasReachedLatestComment) {
                    scrollComponent.scrollToBottomIfPreviouslyAtBottom();
                }
            })
        }

        if (!prevProps.selectedComment && this.props.selectedComment) {
            scrollComponent.scrollToElementWithId(`comment-${this.props.roomId}-${this.props.selectedComment}`, 250)
            setTimeout(() => { this.setState({ inScrollToCommentWindow: false })}, 300);
        }
    }
}

function mapStateToProps(state, ownProps) {
    let room = new Room(ownProps.roomId, state)
    let app = new App(state)
    return {
        hid: room.get('hid'),
        authorUsername: room.author().get('username'),
        currentUserIsAuthor: room.currentUserIsAuthor(),

        comments: room.comments(),
        liveComments: room.liveComments(),
        submittingComments: room.submittingComments(),
        failedComments: room.failedComments(),

        hasLoadedChat: room.hasLoadedChat(),
        commentsFetching: room.get('commentsFetching'),
        commentsFetchType: room.get('commentsFetchType'),
        hasReachedLatestComment: room.get('hasReachedLatestComment'),

        selectedComment: room.get('selectedComment'),

        activeDropdowns: app.get('activeDropdowns', Set())
    }
}

export default connect(mapStateToProps)(ScrollComponent(scrollComponentId, scrollOptions)(ScrollableChatHistory));
