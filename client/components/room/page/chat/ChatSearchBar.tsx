import * as React from 'react'
import { connect } from 'react-redux'

import Icon from '@components/shared/Icon'
import ChatSearchSuggestions from './ChatSearchSuggestions'
import { promptDropdown, closeDropdown } from '@actions/app'
import { searchChat, hideSearchChatResults } from '@actions/pages/room'
import { DispatchProps } from '@types'

interface Props {
    query?: string
    closeable?: boolean
}

type AllProps = Props & DispatchProps

interface State {
    query: string
}

class ChatSearchBar extends React.Component<AllProps, State> {

    static defaultProps: Partial<AllProps> = {
        closeable: false
    }

    constructor(props: AllProps) {
        super(props);

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            query: ''
        }
    }

    componentDidMount() {
        if (this.props.query) {
            this.setState({ query: this.props.query })
        }
    }

    handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        const { dispatch } = this.props
        if (e.charCode === 13) { // enter
            const { query } = this.state
            if (query && query.length > 0) {
                dispatch(searchChat(query, true))
                dispatch(closeDropdown("chat-search-suggestions"))
            }
        }
    }

    handleChange(e: React.FormEvent<HTMLInputElement>) {
        this.setState({ query: e.currentTarget.value })
    }

    handleFocus() {
        this.props.dispatch(promptDropdown("chat-search-suggestions"));
    }

    handleClose() {
        const { dispatch } = this.props
        dispatch(hideSearchChatResults())
        dispatch(closeDropdown("chat-search-suggestions"))
    }

    render() {
        const { closeable } = this.props;
        return (
            <div className="chat_search_container dropdown-chat-search-suggestions_toggle">
                <input className="chat_search" 
                       placeholder="Search chat"
                       ref="search"
                       onKeyPress={this.handleKeyPress}
                       onChange={this.handleChange}
                       onFocus={this.handleFocus}
                       value={this.state.query}
                />
                {closeable ? 
                    <div className="chat_search_icon" onClick={this.handleClose}><Icon type="cancel" /></div> :
                    <div className="chat_search_icon"><Icon type="search" /></div>
                }
                <ChatSearchSuggestions />
            </div>
        )
    }
}

ChatSearchBar.defaultProps = {
    closeable: false
}

export default connect()(ChatSearchBar);