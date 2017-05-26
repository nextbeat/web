import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'

import Icon from '../../../shared/Icon.react'
import { searchChat } from '../../../../actions'

class ChatSearchBar extends React.Component {

    constructor(props) {
        super(props);

        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    handleKeyPress(e) {
        if (e.charCode === 13) { // enter
            const query = findDOMNode(this.refs.search).value;
            if (query && query.length > 0) {
                this.props.dispatch(searchChat(query, true))
            }
        }
    }

    render() {
        return (
            <div className="chat_search_container">
                <input className="chat_search" 
                       placeholder="Search for @username or #tag"
                       ref="search"
                       onKeyPress={this.handleKeyPress}
                />
                <Icon type="search" />
            </div>
        )
    }
}

export default connect()(ChatSearchBar);