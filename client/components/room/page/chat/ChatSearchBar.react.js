import React from 'react'

import Icon from '../../../shared/Icon.react'

class ChatSearchBar extends React.Component {

    constructor(props) {
        super(props);

        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    handleKeyPress() {

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

export default ChatSearchBar;