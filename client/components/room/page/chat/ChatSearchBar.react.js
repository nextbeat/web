import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'

import Icon from '../../../shared/Icon.react'
import { searchChat } from '../../../../actions'

class ChatSearchBar extends React.Component {

    constructor(props) {
        super(props);

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.state = {
            query: ''
        }
    }

    componentDidMount() {
        if (this.props.query) {
            this.setState({ query: this.props.query })
        }
    }

    handleKeyPress(e) {
        if (e.charCode === 13) { // enter
            const { query } = this.state
            if (query && query.length > 0) {
                this.props.dispatch(searchChat(query, true))
            }
        }
    }

    handleChange(e) {
        this.setState({ query: e.target.value })
    }

    render() {
        return (
            <div className="chat_search_container">
                <input className="chat_search" 
                       placeholder="Search for @username or #tag"
                       ref="search"
                       onKeyPress={this.handleKeyPress}
                       onChange={this.handleChange}
                       value={this.state.query}
                />
                <Icon type="search" />
            </div>
        )
    }
}

export default connect()(ChatSearchBar);