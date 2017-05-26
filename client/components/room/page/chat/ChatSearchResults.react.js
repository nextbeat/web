import React from 'react'
import { connect } from 'react-redux'

import SearchResultChatItem from '../../chat/SearchResultChatItem.react'
import Spinner from '../../../shared/Spinner.react'
import Icon from '../../../shared/Icon.react'
import { RoomPage } from '../../../../models'

import { hideSearchChatResults } from '../../../../actions'

class ChatSearchResults extends React.Component {

    constructor(props) {
        super(props);

        this.handleClose = this.handleClose.bind(this);
    }

    handleClose() {
        this.props.dispatch(hideSearchChatResults());
    }

    render() {
        const { searchResults, isFetching, error } = this.props;

        return (
            <div className="chat_search-results">
                <div className="chat_search-results_header">
                    Search results
                    <div className="chat_search-results_close" onClick={this.handleClose}><Icon type="close" /></div>
                </div>
                <ul className="chat_search-results_results">  
                    {searchResults.map((comment, idx) => <SearchResultChatItem key={idx} comment={comment} />)}
                </ul>
            </div>
        )
    }   

}

function mapStateToProps(state) {
    let roomPage = new RoomPage(state)
    return {
        searchResults: roomPage.searchResults(),
        isFetching: roomPage.get('searchResultsFetching'),
        error: roomPage.get('searchResultsError')
    }
}

export default connect(mapStateToProps)(ChatSearchResults);
