import * as PropTypes from 'prop-types'
import * as React from 'react'
import { connect } from 'react-redux'
import { Set, List } from 'immutable'

import ChatItem from '@components/room/chat/ChatItem'
import ChatSearchBar from './ChatSearchBar'
import Spinner from '@components/shared/Spinner'
import Icon from '@components/shared/Icon'
import ScrollComponent, { ScrollComponentProps } from '@components/utils/ScrollComponent'
import App from '@models/state/app'
import RoomPage from '@models/state/pages/room'
import SearchResultComment from '@models/entities/searchResultComment'

import { selectMediaItem, jumpToComment } from '@actions/room'
import { hideSearchChatResults, searchChat, closeDetailSection } from '@actions/pages/room'
import { toggleDropdown } from '@actions/app'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    roomId: number
    hid: string
    authorUsername: string
    isClosed: boolean
    isCurrentUserAuthor: boolean

    searchResults: List<SearchResultComment>
    isFetching: boolean
    hasFetched: boolean
    error: string
    query: string

    activeDropdowns: Set<string>
}

type Props = ConnectProps & DispatchProps & ScrollComponentProps

class ChatSearchResults extends React.Component<Props> {

    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    constructor(props: Props) {
        super(props);

        this.handleClose = this.handleClose.bind(this)
        this.handleSelectMediaItem = this.handleSelectMediaItem.bind(this)
        this.handleSelectChatOptions = this.handleSelectChatOptions.bind(this)
        this.handleRespond = this.handleRespond.bind(this)
        this.handleJump = this.handleJump.bind(this)

        this.renderComment = this.renderComment.bind(this);
    }

    handleClose() {
        this.props.dispatch(hideSearchChatResults());
    }

    handleSelectMediaItem(mediaItemId: number) {
        const { dispatch, roomId } = this.props
        dispatch(selectMediaItem(roomId, mediaItemId));
        // dispatch(hideSearchChatResults())
        dispatch(closeDetailSection())
    }

    handleSelectChatOptions(chatId: string) {
        const { dispatch } = this.props
        dispatch(toggleDropdown(`${chatId}-options`))
    }

    handleRespond(comment: SearchResultComment) {
        const { hid } = this.props;
        this.context.router.push({
            pathname: `/r/${hid}/upload/${comment.get('id')}`
        })
    }

    handleJump(comment: SearchResultComment) {
        const { dispatch, roomId } = this.props;
        dispatch(hideSearchChatResults());
        dispatch(jumpToComment(roomId, comment));
    }


    renderComment(comment: SearchResultComment, idx: number) {
        const { isCurrentUserAuthor, isClosed, activeDropdowns, roomId, authorUsername } = this.props

        const componentId = `comment-search-result-${roomId}-${comment.get('id')}`
        const isDropdownActive = activeDropdowns.includes(`${componentId}-options`)
        const isCreator = authorUsername === comment.author().get('username')

        return <ChatItem
                    id={componentId}
                    key={idx} 
                    comment={comment} 
                    isCreator={isCreator}
                    showOptions={isCurrentUserAuthor && !isClosed}
                    isSearchResult={true}
                    isDropdownActive={isDropdownActive}
                    handleSelectOptions={this.handleSelectChatOptions}
                    handleRespond={this.handleRespond}
                    handleSelectMediaItem={this.handleSelectMediaItem}
                    handleJump={this.handleJump}
                />
    }

    render() {
        const { searchResults, isFetching, hasFetched, error, query } = this.props;

        return (
            <div className="chat_search-results">
                <div className="chat_search-results_header">
                    {query} { isFetching && <Spinner styles={["grey", "small"]} type="chat-search" />}
                    <div className="chat_search-results_close" onClick={this.handleClose}><Icon type="close" /></div>
                </div>
                <div className="chat_search-results_body" id="chat_search-results_body">
                    <ul className="chat_search-results_results">  
                        {searchResults.map((comment, idx) => this.renderComment(comment, idx))}
                    </ul>
                    { ((hasFetched && searchResults.size === 0) || (typeof error !== 'undefined')) &&
                        <div className="chat_search-results_no-results">
                            We couldn't find anything matching your request.
                        </div>
                    }
                </div>
            </div>
        )
    }   

}

const scrollOptions = {
    onScrollToBottom: function(this: ChatSearchResults) {
        const { searchResults, hasFetched, dispatch } = this.props 
        if (hasFetched && searchResults.size > 0) {
            dispatch(searchChat())
        }
    }  
}

function mapStateToProps(state: State): ConnectProps {
    return {
        roomId: RoomPage.get(state, 'id'),
        hid: RoomPage.entity(state).get('hid'),
        authorUsername: RoomPage.entity(state).author().get('username'),
        isClosed: RoomPage.status(state) === 'closed',
        isCurrentUserAuthor: RoomPage.isCurrentUserAuthor(state),

        searchResults: RoomPage.searchResults(state),
        isFetching: RoomPage.get(state, 'searchResultsFetching'),
        hasFetched: RoomPage.get(state, 'searchResultsHasFetched'),
        error: RoomPage.get(state, 'searchResultsError'),
        query: RoomPage.get(state, 'searchQuery'),

        activeDropdowns: App.get(state, 'activeDropdowns', Set())
    }
}

export default connect(mapStateToProps)(ScrollComponent("chat_search-results_body", scrollOptions)(ChatSearchResults));
