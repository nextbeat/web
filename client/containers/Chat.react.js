import React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import ChatItem from '../components/ChatItem.react'
import NotificationChatItem from '../components/NotificationChatItem.react'
import Compose from '../components/Compose.react'
import { loadComments } from '../actions'
import { getPaginatedEntities } from '../utils'

class Chat extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            scrollTop: 0,
            scrollHeight: 0
        }
        this.handleScroll = this.handleScroll.bind(this);
        this.setScrollState = this.setScrollState.bind(this);
        this.renderComment = this.renderComment.bind(this);
    }

    // Component lifecycle methods

    componentWillReceiveProps(nextProps) {
        if (nextProps.stack.get('id') !== this.props.stack.get('id')) {
            // stack has loaded
            this.props.dispatch(loadComments());
        }
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
        const { isFetching, comments } = this.props;
        const history = document.getElementById('history');
        if (history.scrollTop == 0 && !isFetching) {
            this.props.dispatch(loadComments());
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
        // comments are inserted into the DOM
        const history = document.getElementById('history');
        let heightDiff = history.scrollHeight - this.state.scrollHeight;
        if (this.state.scrollTop <= 1) {
            history.scrollTop = heightDiff;
        }
    }

    // Render

    renderComment(comment) {
        const { users } = this.props;
        const username = users.getIn([comment.get('author').toString(), 'username']);
        return comment.get('type') === 'message' ? 
            <ChatItem key={comment.get('id')} message={comment.get('message')} username={username} />
            : <NotificationChatItem key={comment.get('id')} comment={comment} username={username} />
    }

    renderLiveComment(comment, idx) {
        const key = `l${idx}`;
        return comment.get('type') === 'message' ? 
            <ChatItem key={key} message={comment.get('message')} username={comment.get('username')} />
            : <NotificationChatItem key={key} comment={comment} username={comment.get('username')} />
    }

    render() {
        const { comments, isFetching, error, liveComments, user } = this.props;
        return (
        <div id="chat">
            <div id="history">
                { isFetching && <p>Loading...</p>}
                { error && error.length > 0 && <p>Could not load comments.</p>}
                <ul>
                    {comments.reverse().map(comment => this.renderComment(comment))}
                    {liveComments.map((comment, idx) => this.renderLiveComment(comment, idx))}
                </ul>
            </div>
            <Compose user={user} />
        </div>
        );
    }
}

function mapStateToProps(state) {
    const comments = getPaginatedEntities(state, 'comments');

    const users = state.getIn(['entities', 'users']);
    const { isFetching, error } = state.getIn(['pagination', 'comments']).toJS();

    const liveComments = state.getIn(['live', 'comments'], List());

    return {
        comments,
        users,
        isFetching,
        error,
        liveComments
    }
}

export default connect(mapStateToProps)(Chat);
