import React from 'react'
import { connect } from 'react-redux'

import SearchResultChatItem from '../../chat/SearchResultChatItem.react'
import ChatSearchBar from './ChatSearchBar.react'
import Spinner from '../../../shared/Spinner.react'
import Icon from '../../../shared/Icon.react'
import ScrollComponent from '../../../utils/ScrollComponent.react'
import { RoomPage } from '../../../../models'

import { hideSearchChatResults, searchChat } from '../../../../actions'

class ChatSearchResults extends React.Component {

    constructor(props) {
        super(props);

        this.handleClose = this.handleClose.bind(this);
    }

    handleClose() {
        this.props.dispatch(hideSearchChatResults());
    }

    render() {
        const { searchResults, isFetching, hasFetched, error, query } = this.props;

        return (
            <div className="chat_search-results">
                <ChatSearchBar query={query} />
                <div className="chat_search-results_header">
                    Search results { isFetching && <Spinner type="grey small chat-search" />}
                    <div className="chat_search-results_close" onClick={this.handleClose}><Icon type="close" /></div>
                </div>
                <div className="chat_search-results_body" id="chat_search-results_body">
                    <ul className="chat_search-results_results">  
                        {searchResults.map((comment, idx) => <SearchResultChatItem key={idx} comment={comment} />)}
                    </ul>
                    { hasFetched && searchResults.size === 0 &&
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
    onScrollToBottom: function() {
        const { searchResults, hasFetched, dispatch } = this.props 
        if (hasFetched && searchResults.size > 0) {
            dispatch(searchChat())
        }
    }  
}

function mapStateToProps(state) {
    let roomPage = new RoomPage(state)
    return {
        searchResults: roomPage.searchResults(),
        isFetching: roomPage.get('searchResultsFetching'),
        hasFetched: roomPage.get('searchResultsHasFetched'),
        error: roomPage.get('searchResultsError'),
        query: roomPage.get('searchQuery')
    }
}

export default connect(mapStateToProps)(ScrollComponent("chat_search-results_body", scrollOptions)(ChatSearchResults));
