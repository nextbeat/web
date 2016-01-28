import React from 'react';
import ChatItem from './ChatItem.react';

class Chat extends React.Component {

    constructor(props) {
        super(props);
        this.displayName = 'Chat';
        this.state = { comments: [] }
    }

    componentWillReceiveProps(nextProps) {
        if (Object.keys(this.props.stack).length === 0 && Object.keys(nextProps.stack).length > 0) {
            // received stack info from parent component
            var stack = nextProps.stack;
            $.ajax('/api/stacks/' + stack.uuid + '/comments').done(res => {
                console.log(res);
                this.setState({
                    comments: res.objects
                });
            });
        }
    }

    render() {
        return (
        <div id="chat">
            <ul>
                {this.state.comments.map(comment => <ChatItem comment={comment} />)}
            </ul>
        </div>
        );
    }
}

export default Chat;
