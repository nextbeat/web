import React from 'react'
import { connect } from 'react-redux'
import ScrollComponent from '../../utils/ScrollComponent.react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import ChatItem from './ChatItem.react'
import LiveChatItem from './LiveChatItem.react'
import NotificationChatItem from './NotificationChatItem.react'
import ChatbotChatItem from './ChatbotChatItem.react'
import Compose from './Compose.react'
import UserActions from './UserActions.react'
import Spinner from '../../shared/Spinner.react'

import { loadComments, sendComment, promptChatActionsForUser } from '../../../actions'
import { Stack, CurrentUser } from '../../../models'

class Chat extends React.Component {

    constructor(props) {
        super(props);

        this.sendComment = this.sendComment.bind(this);
        this.handleSelectUsername = this.handleSelectUsername.bind(this);

        this.renderComment = this.renderComment.bind(this);
    }

    // Sending comments

    sendComment(message) {
        this.props.dispatch(sendComment(message));
    }

    handleSelectUsername(username) {
        this.props.dispatch(promptChatActionsForUser(username));
    }

    // Render

    renderComment(comment) {
        const { users, stackAuthor } = this.props;
        const username = comment.get('author') && users.getIn([comment.get('author').toString(), 'username'], 'anon');
        const isCreator = (stackAuthor.get('username') === username);

        if (comment.get('type') === 'message') {
            return <ChatItem 
                        key={comment.get('id')} 
                        comment={comment} 
                        username={username} 
                        isCreator={isCreator} 
                        handleSelectUsername={this.handleSelectUsername}
                    />
        } else if (comment.get('type') === 'notification') {
            return <NotificationChatItem 
                        key={comment.get('id')} 
                        comment={comment} 
                        username={username} 
                    />
        } else {
            return null;
        }
    }

    renderLiveComment(comment, idx) {
        const { stackAuthor } = this.props;
        const key = `l${idx}`;
        const isCreator = (stackAuthor.get('username') === comment.get('username'));

        if (comment.get('type') === 'message') {
            return <LiveChatItem 
                        key={key} 
                        comment={comment} 
                        isCreator={isCreator} 
                        handleSelectUsername={this.handleSelectUsername}
                    />
        } else if (comment.get('type') === 'notification') {
            return <NotificationChatItem 
                        key={key} 
                        comment={comment} 
                        username={comment.get('username')} 
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
        const { comments, stack, isFetching, error, liveComments, user, display } = this.props;
        const closed = stack.get('closed');
        return (
        <div className="chat" style={{ display: (display ? "block" : "none") }}>
            <UserActions />
            <div id="history" className="chat_history">
                { isFetching && <Spinner type="grey" />}
                { error && error.length > 0 && <p>Could not load comments.</p>}
                <ul className="chat_items">
                    {comments.reverse().map(comment => this.renderComment(comment))}
                    {liveComments.map((comment, idx) => this.renderLiveComment(comment, idx))}
                </ul>
            </div>
            <Compose user={user} stack={stack} />
            <ReactCSSTransitionGroup transitionName="chat_lost-connection" transitionEnterTimeout={300} transitionLeaveTimeout={200}>
                { !!user.get('lostConnection') && 
                    <div key="lost-connection" className="chat_lost-connection">
                        Lost connection. Reconnecting...
                    </div>
                }
            </ReactCSSTransitionGroup>
        </div>
        );
    }
}

function mapStateToProps(state) {
    const stack = new Stack(state)
    const users = state.getIn(['entities', 'users']);
    const user = new CurrentUser(state)

    return {
        stack,
        user,
        comments: stack.comments(),
        users,
        stackAuthor: stack.author(),
        isFetching: stack.get('commentsFetching'),
        error: stack.get('commentsError'),
        liveComments: stack.liveComments()
    }
}

const scrollOptions = {

    onScrollToTop: function(scrollComponent) {
        const { isFetching, stack, dispatch } = this.props
        if (!isFetching && stack.get('id')) {
            dispatch(loadComments(stack.get('uuid')))
        }
    },

    onComponentDidUpdate: function(scrollComponent, prevProps) {
        if (prevProps.comments.size !== this.props.comments.size) {
            scrollComponent.keepScrollPosition()
            scrollComponent.scrollToBottomIfPreviouslyAtBottom(prevProps.comments.size)
            scrollComponent.setScrollState()
        }
        if (prevProps.liveComments.size !== this.props.liveComments.size) {
            scrollComponent.scrollToBottomIfPreviouslyAtBottom(this.props.liveComments.size)
            scrollComponent.setScrollState()
        }
    }

}

export default connect(mapStateToProps)(ScrollComponent('history', scrollOptions)(Chat));
