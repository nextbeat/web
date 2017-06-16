import React from 'react'
import { connect } from 'react-redux'
import { Set } from 'immutable'

import ChatItem from '../../chat/ChatItem.react'
import ChatSearchBar from './ChatSearchBar.react'
import Spinner from '../../../shared/Spinner.react'
import Icon from '../../../shared/Icon.react'
import ScrollComponent from '../../../utils/ScrollComponent.react'
import { RoomPage, App } from '../../../../models'

import { hideSearchChatResults, searchChat, selectMediaItem, closeDetailSection, toggleDropdown, jumpToComment } from '../../../../actions'

class ChatSearchResults extends React.Component {

    constructor(props) {
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

    handleSelectMediaItem(mediaItemId) {
        const { dispatch, roomId } = this.props
        dispatch(selectMediaItem(roomId, mediaItemId));
        // dispatch(hideSearchChatResults())
        dispatch(closeDetailSection())
    }

    handleSelectChatOptions(chatId) {
        const { dispatch } = this.props
        dispatch(toggleDropdown(`${chatId}-options`))
    }

    handleRespond(comment) {
        const { hid } = this.props;
        this.context.router.push({
            pathname: `/r/${hid}/upload/${comment.get('id')}`
        })
    }

    handleJump(comment) {
        const { dispatch, roomId } = this.props;
        dispatch(hideSearchChatResults());
        dispatch(jumpToComment(roomId, comment));
        dispatch(closeDetailSection())
    }


    renderComment(comment, idx) {
        const { currentUserIsAuthor, hasClosed, activeDropdowns, roomId } = this.props

        const componentId = `comment-search-result-${roomId}-${comment.get('id')}`
        const isDropdownActive = activeDropdowns.includes(`${componentId}-options`)

        return <ChatItem
                    id={componentId}
                    key={idx} 
                    comment={comment} 
                    showOptions={currentUserIsAuthor && !hasClosed}
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
                <ChatSearchBar query={query} closeable={true} />
                <div className="chat_search-results_header">
                    Search results { isFetching && <Spinner type="grey small chat-search" />}
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

ChatSearchResults.contextTypes = {
    router: React.PropTypes.object.isRequired
}

const scrollOptions = {
    onScrollToBottom: function() {
        const { searchResults, hasFetched, dispatch } = this.props 
        if (hasFetched && searchResults.size > 0) {
            dispatch(searchChat())
        }
    }  
}

function mapStateToProps(state) {
    let roomPage = new RoomPage(state)
    let app = new App(state)
    return {
        roomId: roomPage.get('id'),
        hid: roomPage.get('hid'),
        isClosed: roomPage.get('closed'),
        currentUserIsAuthor: roomPage.currentUserIsAuthor(),

        searchResults: roomPage.searchResults(),
        isFetching: roomPage.get('searchResultsFetching'),
        hasFetched: roomPage.get('searchResultsHasFetched'),
        error: roomPage.get('searchResultsError'),
        query: roomPage.get('searchQuery'),

        activeDropdowns: app.get('activeDropdowns', Set())
    }
}

export default connect(mapStateToProps)(ScrollComponent("chat_search-results_body", scrollOptions)(ChatSearchResults));
