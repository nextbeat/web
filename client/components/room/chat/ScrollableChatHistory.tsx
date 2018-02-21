import * as PropTypes from 'prop-types'
import * as React from 'react'
import { connect } from 'react-redux'
import { List, Set } from 'immutable'

import ScrollComponent, { ScrollComponentProps } from '@components/utils/ScrollComponent'
import Spinner from '@components/shared/Spinner'

import ChatItem from './ChatItem'
import NotificationChatItem from './NotificationChatItem'
import commentReducer from './utils/commentReducer'

import { toggleDropdown } from '@actions/app'
import { loadComments, resendComment, selectMediaItem } from '@actions/room'
import { promptChatActionsForUser,searchChat } from '@actions/pages/room'
import App from '@models/state/app'
import Room, { FetchDirection } from '@models/state/room'
import RoomPage, { DetailSection } from '@models/state/pages/room'
import Comment from '@models/entities/comment'
import TemporaryComment from '@models/entities/temporary/comment'
import { State, DispatchProps } from '@types'

interface OwnProps {
    roomId: number
    style?: string
}

interface ConnectProps {
    hid: string
    isClosed: boolean
    authorUsername: string
    isCurrentUserAuthor: boolean
    
    comments: List<Comment>
    liveComments: List<Comment>
    submittingComments: List<TemporaryComment>
    failedComments: List<TemporaryComment>

    hasLoadedChat: boolean
    commentsFetching: boolean
    commentsFetchType: FetchDirection
    hasReachedLatestComment: boolean
    selectedComment: number

    activeDropdowns: Set<string>

    selectedDetailSection: DetailSection | null
}

type Props = OwnProps & ConnectProps & DispatchProps & ScrollComponentProps

interface ChatState {
    inMessageArchive: boolean
    hasUnseenLiveMessages: boolean
    inScrollToCommentWindow: boolean

    shouldScrollToBottomOnSelectingChatSection: boolean
}

function scrollComponentId(props: Props) {
    return `history-${props.roomId}-${props.style}-scroll`
}

class ScrollableChatHistory extends React.Component<Props, ChatState> {

    static defaultProps: Partial<Props> = {
        style: 'expanded'
    }

    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    constructor(props: Props) {
        super(props);

        this.handleSelectUsername = this.handleSelectUsername.bind(this)
        this.handleSelectHashtag = this.handleSelectHashtag.bind(this)
        this.handleSelectMediaItem = this.handleSelectMediaItem.bind(this)
        this.handleSelectChatOptions = this.handleSelectChatOptions.bind(this)

        this.handleResend = this.handleResend.bind(this)
        this.handleRespond = this.handleRespond.bind(this)
        this.handleJumpToPresent = this.handleJumpToPresent.bind(this)

        this.renderComment = this.renderComment.bind(this)

        this.state = {
            inMessageArchive: false,
            hasUnseenLiveMessages: false,
            inScrollToCommentWindow: false,
            shouldScrollToBottomOnSelectingChatSection: false
        }
    }

    componentDidMount() {
        // Prevents document from scrolling when inside chat history element
        // Sourced from http://stackoverflow.com/a/20520619
        $(`#${scrollComponentId(this.props)}`).on('mousewheel DOMMouseScroll', function(e: JQueryEventObject) {
            var direction = (e.originalEvent as MouseWheelEvent).wheelDelta || -(e.originalEvent as MouseWheelEvent).detail;
            if ((direction > 0 && this.scrollTop === 0
                || direction <= 0 && this.scrollTop == this.scrollHeight-this.offsetHeight)
                && this.scrollHeight > this.offsetHeight)
            {
                e.preventDefault();
            }
        })

        if (this.props.comments.size > 0 && this.props.commentsFetchType === 'mostRecent') {
            this.props.scrollToBottom()
            this.props.setScrollState()

            process.nextTick(() => {
                if (this.props.selectedDetailSection && this.props.selectedDetailSection !== 'chat') {
                    this.setState({ shouldScrollToBottomOnSelectingChatSection: true })
                }
            })
            
        }
    }

    componentDidUpdate(prevProps: Props) {    

        if (this.props.commentsFetchType === 'around' && this.props.commentsFetching && !this.state.inScrollToCommentWindow) {
            this.setState({ inScrollToCommentWindow: true })
        }

        if (this.props.comments.size > 0 && !this.props.hasReachedLatestComment && !this.state.inMessageArchive) {
            this.setState({ inMessageArchive: true });
        }

        if (this.props.commentsFetchType === 'mostRecent' && this.props.commentsFetching && this.state.inMessageArchive) {
            this.setState({ inMessageArchive: false });
        }

        if (prevProps.comments.size < this.props.comments.size || (!prevProps.hasLoadedChat && this.props.hasLoadedChat)) {
            if (this.props.commentsFetchType === 'before') {
                this.props.keepScrollPosition()
                this.props.setScrollState()
            } else if (this.props.commentsFetchType === 'around' || this.props.commentsFetchType === 'mostRecent') {
                this.props.scrollToBottom()
                this.props.setScrollState()

                if (this.props.selectedDetailSection && this.props.selectedDetailSection !== 'chat') {
                    // If the chat isn't selected initially (e.g. after a room is closed),
                    // then the chat element will have 0 height (as it is not displayed),
                    // and scrollToBottom() will do nothing. We set a flag to scroll to 
                    // bottom when the user first switches to the chat section.
                    this.setState({ shouldScrollToBottomOnSelectingChatSection: true })
                }

                // Ugly hack. Because the chat_compose element varies in height
                // depending on whether or not there are chat tags, the previous
                // scrollToBottom call will often be off by an offset of 22 pixels
                // (the height of the chat tags element, which doesn't render
                // until after componentDidUpdate in this component is called).
                // We call scrollToBottom again, after both elements have 
                // (conditionally) rendered, to account for this discrepancy.
                process.nextTick(() => {
                    this.props.scrollToBottom()
                    this.props.setScrollState()
                })
            }
        }

        if (prevProps.submittingComments.size < this.props.submittingComments.size) {
            this.props.scrollToBottom()
            this.props.setScrollState()
        }

        if (prevProps.failedComments.size < this.props.failedComments.size) {
            this.props.scrollToBottomIfPreviouslyAtBottom()
        }

        if (prevProps.liveComments.size < this.props.liveComments.size) {
            // for some reason, on mobile browsers the dom doesn't properly 
            // update until the next cycle
            process.nextTick(() => {
                let lastComment = this.props.liveComments.last()
                if (lastComment && !lastComment.has('temporary_id')) {
                    // we want to ignore user-submitted comments
                    if (!this.props.isScrolledToBottom() && !this.state.hasUnseenLiveMessages) {
                        this.setState({ hasUnseenLiveMessages: true })
                    }
                }
                if (this.props.hasReachedLatestComment) {
                    this.props.scrollToBottomIfPreviouslyAtBottom();
                }
            })
        }

        if (!prevProps.selectedComment && this.props.selectedComment) {
            process.nextTick(() => {
                const commentId = `comment-${this.props.roomId}-${this.props.selectedComment}`
                this.props.scrollToElementWithId(commentId, 250)
                window.setTimeout(() => { this.setState({ inScrollToCommentWindow: false })}, 300);
            })
        }

        if (prevProps.selectedDetailSection !== 'chat' && this.props.selectedDetailSection === 'chat') {
            if (this.state.shouldScrollToBottomOnSelectingChatSection) {
                this.props.scrollToBottom()
                this.props.setScrollState()

                this.setState({
                    shouldScrollToBottomOnSelectingChatSection: false
                })
            }
        }
                
    }

    componentWillUnmount() {
         $(`#${scrollComponentId(this.props)}`).off('mousewheel DOMMouseScroll')
    }

    // Events

    handleSelectUsername(username: string) {
        this.props.dispatch(promptChatActionsForUser(username))
    }

    handleSelectHashtag(tag: string) {
        this.props.dispatch(searchChat(tag))
    }

    handleSelectMediaItem(mediaItemId: number) {
        const { dispatch, roomId } = this.props
        dispatch(selectMediaItem(roomId, mediaItemId));
    }

    handleSelectChatOptions(chatId: string) {
        const { dispatch } = this.props
        dispatch(toggleDropdown(`${chatId}-options`))
    }

    handleResend(comment: TemporaryComment) {
        const { dispatch, roomId } = this.props
        dispatch(resendComment(roomId, comment))
    }

    handleRespond(comment: Comment) {
        const { hid } = this.props;
        this.context.router.push({
            pathname: `/r/${hid}/upload/${comment.get('id')}`
        })
    }

    handleJumpToPresent() {
        const { dispatch, roomId } = this.props 
        dispatch(loadComments(roomId, 'mostRecent'))
    }

    // Render

    renderComment(comment: Comment | TemporaryComment, idx: number) {
        const { roomId, authorUsername, isCurrentUserAuthor, isClosed, activeDropdowns, selectedComment } = this.props;

        const isCreator = (comment.author() as any).get('username') === authorUsername;
        const componentId = `comment-${roomId}-${comment.get('id')}`
        const isDropdownActive = activeDropdowns.includes(`${componentId}-options`)
        const isSelected = !!comment.get('id') && comment.get('id') === selectedComment;

        if (comment.get('type') === 'message') {
            return <ChatItem 
                        id={componentId}
                        key={idx} 
                        comment={comment}
                        isCreator={isCreator} 
                        showHeader={!comment.__no_header__}
                        showOptions={isCurrentUserAuthor && !isClosed}
                        handleSelectUsername={this.handleSelectUsername}
                        handleSelectHashtag={this.handleSelectHashtag}
                        handleSelectMediaItem={this.handleSelectMediaItem}
                        handleSelectOptions={this.handleSelectChatOptions}
                        handleRespond={this.handleRespond}
                        handleResend={this.handleResend}
                        isDropdownActive={isDropdownActive}
                        isSelected={isSelected}
                    />
        } else if (comment instanceof Comment && comment.get('type') === 'notification') {
            return <NotificationChatItem 
                        key={idx}
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

        let commentsList: List<Comment | TemporaryComment> = comments.reverse();
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
                        <Spinner styles={["grey"]} />
                    </div>
                }
                <div id={scrollComponentId(this.props)} className={`chat_history scrollable ${styleClass}`}>
                    { commentsFetching && commentsFetchType !== 'after' && <Spinner styles={["grey"]} />}
                    <ul className="chat_items">
                        { commentsList.reduce(commentReducer, List()).map((comment, idx) => this.renderComment(comment, idx)) }
                    </ul>
                    { commentsFetching && commentsFetchType === 'after' && <Spinner styles={["grey"]} />}
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

const scrollOptions = {

    onScrollToTop: function(this: ScrollableChatHistory) {
        const { roomId, commentsFetching, dispatch } = this.props

        if (!commentsFetching && roomId) {
            dispatch(loadComments(roomId, 'before'))
        }
    },

    onScrollToBottom: function(this: ScrollableChatHistory) {
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
    }

}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    const id = ownProps.roomId
    return {
        hid: Room.entity(state, id).get('hid'),
        isClosed: Room.status(state, id) === 'closed',
        authorUsername: Room.author(state, id).get('username'),
        isCurrentUserAuthor: Room.isCurrentUserAuthor(state, id),

        comments: Room.comments(state, id),
        liveComments: Room.liveComments(state, id),
        submittingComments: Room.submittingComments(state, id),
        failedComments: Room.failedComments(state, id),

        hasLoadedChat: Room.hasLoadedChat(state, id),
        commentsFetching: Room.get(state, id, 'commentsFetching'),
        commentsFetchType: Room.get(state, id, 'commentsFetchType'),
        hasReachedLatestComment: Room.get(state, id, 'hasReachedLatestComment'),
        selectedComment: Room.get(state, id, 'selectedComment'),

        activeDropdowns: App.get(state, 'activeDropdowns', Set<string>()),

        selectedDetailSection: RoomPage.get(state, 'selectedDetailSection') || null
    }
}

export default connect(mapStateToProps)(ScrollComponent(scrollComponentId, scrollOptions)(ScrollableChatHistory));
