import React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'
import ScrollComponent from '../../utils/ScrollComponent.react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import ChatItem from './ChatItem.react'
import NotificationChatItem from './NotificationChatItem.react'
import Spinner from '../../shared/Spinner.react'
import commentReducer from './utils/commentReducer'

import { loadComments, promptChatActionsForUser, resendComment } from '../../../actions'
import { Room, CurrentUser, App } from '../../../models'

function scrollComponentId(props) {
    return `history-${props.roomId}-'no-scroll'`
}

class SmallFixedChatHistory extends React.Component {

    constructor(props) {
        super(props);

        this.renderComment = this.renderComment.bind(this)
        this.renderLiveComment = this.renderLiveComment.bind(this)

        this.state = {
            hasUnseenLiveMessages: false
        }
    }

    // Render

    renderComment(comment, idx) {
        const { authorUsername, roomId } = this.props;
        const isCreator = comment.author().get('username') === authorUsername;

        if (comment.get('type') === 'message') {
            return <ChatItem 
                        key={comment.get('id')} 
                        comment={comment}
                        isCreator={isCreator} 
                        handleSelectUsername={this.handleSelectUsername}
                        isCollapsed={true}
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
        const { authorUsername, comments, roomId } = this.props;
        const key = `l${idx}`;
        const isCreator = (authorUsername === comment.author().get('username'));

        if (comment.get('type') === 'message') {
            return <ChatItem 
                        key={key} 
                        comment={comment} 
                        isCreator={isCreator} 
                        handleSelectUsername={this.handleSelectUsername}
                        isCollapsed={true}
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

    render() {
        const { comments, liveComments,
                hasLoadedChat, commentsFetching } = this.props;

        return (
            <div className="chat_history_container">
                {!hasLoadedChat &&
                    <div className="chat_history_overlay">
                        <Spinner type="grey" />
                    </div>
                }
                <div id={scrollComponentId(this.props)} className="chat_history chat_history-small-fixed">
                    { commentsFetching && <Spinner type="grey" />}
                    <ul className="chat_items">
                        {comments.reverse().reduce(commentReducer, List()).map((comment, idx) => this.renderComment(comment, idx))}
                        {liveComments.reduce(commentReducer, List()).map((comment, idx) => this.renderLiveComment(comment, idx))}
                    </ul>
                </div>
            </div>
        );
    }
}

SmallFixedChatHistory.propTypes = {
    roomId: React.PropTypes.number.isRequired,
}

const scrollOptions = {

    onComponentDidMount: function(scrollComponent, props) {
        scrollComponent.scrollToBottom();
    },

    onComponentDidUpdate: function(scrollComponent, prevProps) {

        if (prevProps.comments.size < this.props.comments.size) {
            scrollComponent.scrollToBottom()
        }

        if (prevProps.liveComments.size < this.props.liveComments.size) {
            // for some reason, on mobile browsers the dom doesn't properly 
            // update until the next cycle
            process.nextTick(() => {
                scrollComponent.scrollToBottom()
            })
        }
    },

    onResize: function(scrollComponent, props) {
        // want to always keep static chat history at bottom of element
        scrollComponent.scrollToBottom();
    }
}

function mapStateToProps(state, ownProps) {
    let room = new Room(ownProps.roomId, state)
    return {
        authorUsername: room.author().get('username'),

        comments: room.latestComments(),
        liveComments: room.liveComments(),

        hasLoadedChat: room.hasLoadedChat(),
        commentsFetching: room.get('commentsFetching')
    }
}

export default connect(mapStateToProps)(ScrollComponent(scrollComponentId, scrollOptions)(SmallFixedChatHistory));
