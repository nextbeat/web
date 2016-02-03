import React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import ChatItem from '../components/ChatItem.react'
import { loadComments } from '../actions'

class Chat extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.stack.get('id') !== this.props.stack.get('id')) {
            // stack has loaded
            this.props.dispatch(loadComments());
        }
    }

    render() {
        const { comments, users } = this.props;
        return (
        <div id="chat">
            <ul>
                {comments.reverse().map(comment => <ChatItem key={comment.get('id')} comment={comment} author={users.get(comment.get('author').toString())} />)}
            </ul>
        </div>
        );
    }
}

function mapStateToProps(state) {
    const comments = state.getIn(['pagination', 'comments', 'ids'], List())
        .map(id => state.getIn(['entities', 'comments', id.toString()]));

    const users = state.getIn(['entities', 'users']);

    return {
        comments,
        users
    }
}

export default connect(mapStateToProps)(Chat);
