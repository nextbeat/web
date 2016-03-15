import React from 'react'
import { connect } from 'react-redux'

import ChatItem from './ChatItem.react'
import NotificationChatItem from './NotificationChatItem.react'
import Compose from './Compose.react'
import Spinner from '../../shared/Spinner.react'

import { loadComments, sendComment } from '../../../actions'
import { Stack, CurrentUser } from '../../../models'

class Chat extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            scrollTop: 0,
            scrollHeight: 0
        }
        this.handleScroll = this.handleScroll.bind(this);
        this.setScrollState = this.setScrollState.bind(this);
        this.sendComment = this.sendComment.bind(this);
        this.renderComment = this.renderComment.bind(this);
    }

    // Component lifecycle methods

    componentWillReceiveProps(nextProps) {
        this.setScrollState();
    }

    componentDidMount() {
        $('#history').on('scroll', this.handleScroll)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.comments.size !== this.props.comments.size) {
            this.keepScrollPositionIfNeeded();
            this.scrollToBottomIfNeeded(prevProps.comments.size);
            this.setScrollState();
        }
        if (prevProps.liveComments.size !== this.props.liveComments.size) {
            this.scrollToBottomIfNeeded(this.props.liveComments.size);
            this.setScrollState();
        }
    }

    componentWillUnmount() {
        $('#history').off('scroll', this.handleScroll);
    }

    // Scroll UI logic methods

    setScrollState() {
        const history = document.getElementById('history');
        this.setState({
            scrollTop: history.scrollTop,
            scrollHeight: history.scrollHeight
        });
    }

    handleScroll() {
        const { isFetching, comments, stack, dispatch } = this.props;
        const history = document.getElementById('history');
        if (history.scrollTop == 0 && !isFetching && stack.get('id')) {
            dispatch(loadComments(stack.get('uuid')));
        } 
    }

    scrollToBottomIfNeeded(currSize) {
        const history = document.getElementById('history');
        let isScrolledToBottom = this.state.scrollHeight - history.clientHeight <= this.state.scrollTop + 1;
        if (isScrolledToBottom || currSize === 0) {
            history.scrollTop = history.scrollHeight - history.clientHeight;
        }
    }

    keepScrollPositionIfNeeded() {
        // Used when requesting new page. Necessary so that when the new
        // comments are inserted into the DOM the scroll position adjusts
        // so that the current content doesn't shift
        const history = document.getElementById('history');
        let heightDiff = history.scrollHeight - this.state.scrollHeight;
        if (this.state.scrollTop <= 1) {
            history.scrollTop = heightDiff;
        }
    }

    // Sending comments

    sendComment(message) {
        this.props.dispatch(sendComment(message));
    }

    // Render

    renderComment(comment) {
        const { users, stackAuthor } = this.props;
        const username = users.getIn([comment.get('author').toString(), 'username']);
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

export default connect(mapStateToProps)(Chat);
