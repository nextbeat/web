import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'
import ScrollComponent, { ScrollComponentProps } from '@components/utils/ScrollComponent'

import ChatItem from './ChatItem'
import NotificationChatItem from './NotificationChatItem'
import Spinner from '@components/shared/Spinner'
import commentReducer from './utils/commentReducer'

import { loadComments, resendComment } from '@actions/room'
import { promptChatActionsForUser } from '@actions/pages/room'
import Room from '@models/state/room'
import Comment from '@models/entities/comment'
import { State, DispatchProps } from '@types'

interface OwnProps {
    roomId: number
}

interface ConnectProps {
    authorUsername: string

    comments: List<Comment>
    liveComments: List<Comment>

    hasLoadedChat: boolean
    commentsFetching: boolean
}

type Props = OwnProps & ConnectProps & DispatchProps & ScrollComponentProps

interface ChatState {
    hasUnseenLiveMessages: boolean
}

function scrollComponentId(props: Props) {
    return `history-${props.roomId}-'no-scroll'`
}

class SmallFixedChatHistory extends React.Component<Props, ChatState> {

    constructor(props: Props) {
        super(props);

        this.renderComment = this.renderComment.bind(this)
        this.renderLiveComment = this.renderLiveComment.bind(this)

        this.state = {
            hasUnseenLiveMessages: false
        }
    }

    componentDidMount() {
        this.props.scrollToBottom()
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.comments.size < this.props.comments.size) {
            this.props.scrollToBottom()
        }

        if (prevProps.liveComments.size < this.props.liveComments.size) {
            // for some reason, on mobile browsers the dom doesn't properly 
            // update until the next cycle
            process.nextTick(() => {
                this.props.scrollToBottom()
            })
        }
    }

    handleResize() {
        // want to always keep static chat history at bottom of element
        this.props.scrollToBottom();
    }

    // Render

    renderComment(comment: Comment, idx: number) {
        const { authorUsername, roomId } = this.props;
        const isCreator = comment.author().get('username') === authorUsername;

        if (comment.get('type') === 'message') {
            return <ChatItem 
                        key={comment.get('id')} 
                        comment={comment}
                        isCreator={isCreator} 
                        isCollapsed={true}
                    />
        } else if (comment.get('type') === 'notification') {
            return <NotificationChatItem 
                        key={comment.get('id')} 
                        comment={comment} 
                        username={authorUsername}
                        count={comment.__count__}
                    />
        }
    }

    renderLiveComment(comment: Comment, idx: number) {
        const { authorUsername, comments, roomId } = this.props;
        const key = `l${idx}`;
        const isCreator = (authorUsername === comment.author().get('username'));

        if (comment.get('type') === 'message') {
            return <ChatItem 
                        key={key} 
                        comment={comment} 
                        isCreator={isCreator} 
                        isCollapsed={true}
                    />
        } else if (comment.get('type') === 'notification') {
            return <NotificationChatItem 
                        key={key} 
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
                        <Spinner styles={["grey"]} />
                    </div>
                }
                <div id={scrollComponentId(this.props)} className="chat_history chat_history-small-fixed">
                    { commentsFetching && <Spinner styles={["grey"]} />}
                    <ul className="chat_items">
                        {comments.reverse().reduce(commentReducer, List()).map((comment, idx) => this.renderComment(comment, idx))}
                        {liveComments.reduce(commentReducer, List()).map((comment, idx) => this.renderLiveComment(comment, idx))}
                    </ul>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    let id = ownProps.roomId
    return {
        authorUsername: Room.author(state, id).get('username'),

        comments: Room.latestComments(state, id),
        liveComments: Room.liveComments(state, id),

        hasLoadedChat: Room.hasLoadedChat(state, id),
        commentsFetching: Room.get(state, id, 'commentsFetching')
    }
}

export default connect(mapStateToProps)(ScrollComponent(scrollComponentId)(SmallFixedChatHistory));
