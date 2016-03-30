import React from 'react'
import { connect } from 'react-redux'
import ScrollComponent from '../../utils/ScrollComponent.react'

import ChatItem from './ChatItem.react'
import NotificationChatItem from './NotificationChatItem.react'
import Compose from './Compose.react'
import Spinner from '../../shared/Spinner.react'

import { loadComments, sendComment } from '../../../actions'
import { Stack, CurrentUser } from '../../../models'

class Chat extends React.Component {

    constructor(props) {
        super(props);

        this.sendComment = this.sendComment.bind(this);
        this.renderComment = this.renderComment.bind(this);
    }

    // Sending comments

    sendComment(message) {
        this.props.dispatch(sendComment(message));
    }

    // Render

    renderComment(comment) {
        const { users, stackAuthor } = this.props;
        const username = users.getIn([comment.get('author').toString(), 'username'], 'anon');
        const isCreator = (stackAuthor.get('username') === username);
        return comment.get('type') === 'message' ? 
            <ChatItem key={comment.get('id')} message={comment.get('message')} username={username} isCreator={isCreator} />
            : <NotificationChatItem key={comment.get('id')} comment={comment} username={username} />
    }

    renderLiveComment(comment, idx) {
        const { stackAuthor } = this.props;
        const key = `l${idx}`;
        const isCreator = (stackAuthor.get('username') === comment.get('username'));
        return comment.get('type') === 'message' ? 
            <ChatItem key={key} message={comment.get('message')} username={comment.get('username')} isCreator={isCreator} />
            : <NotificationChatItem key={key} comment={comment} username={comment.get('username')} />
    }

    render() {
        const { comments, isFetching, error, liveComments, user } = this.props;
        const closed = this.props.stack.get('closed');
        return (
        <div className="chat">
            <div id="history" className="chat_history">
                { isFetching && <Spinner type="grey" />}
                { error && error.length > 0 && <p>Could not load comments.</p>}
                <ul className="chat_items">
                    {comments.reverse().map(comment => this.renderComment(comment))}
                    {liveComments.map((comment, idx) => this.renderLiveComment(comment, idx))}
                </ul>
            </div><Compose user={user} closed={closed} sendComment={this.sendComment} />
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
