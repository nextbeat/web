import React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import Dropdown from '../../../shared/Dropdown.react'
import Spinner from '../../../shared/Spinner.react'
import { App, RoomPage } from '../../../../models'
import { getSearchSuggestions, searchChat, closeDropdown } from '../../../../actions'

class ChatSearchSuggestions extends React.Component {

    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(term) {
        const { dispatch } = this.props
        dispatch(searchChat(term, true));
        dispatch(closeDropdown('chat-search-suggestions'));
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.isActive && nextProps.isActive) {
            this.props.dispatch(getSearchSuggestions())
        }
    }

    defaultTerms() {
        const attrs = {className: "chat_search-suggestions_term chat_search-suggestions_term-default"};
        return List([
            <li key={1} {...attrs}>
                from:<span className="chat_search-suggestions_term-default_template">username</span>
            </li>,
            <li key={2} {...attrs}>
                @<span className="chat_search-suggestions_term-default_template">username</span> <span className="chat_search-suggestions_term-default_detail">for mentions</span>
            </li>,
            <li key={3} {...attrs}>
                #<span className="chat_search-suggestions_term-default_template">tag</span>
            </li>
        ])
    }

    render() {
        const { terms, isFetching, hasFetched, history } = this.props;
        return (
            <Dropdown type="chat-search-suggestions" triangleMargin={-1}>
                <div className="chat_search-suggestions_main">
                    <div className="chat_search-suggestions_section">
                        <div className="chat_search-suggestions_header">
                            Suggestions
                        </div>
                        { isFetching &&
                            [
                            <Spinner key="spinner" type="grey" />,
                            <ul key="list" className="chat_search-suggestions_list">
                                { /* Fills out section to proper height */ }
                                { [1,2,3].map(idx => <li key={idx} className="chat_search-suggestions_term chat_search-suggestions_term-dummy">foo</li>) }
                            </ul>
                            ]
                        }
                        { hasFetched && 
                            <ul className="chat_search-suggestions_list">
                                { terms.map((term, idx) => 
                                    <li key={idx} 
                                        className="chat_search-suggestions_term" 
                                        onClick={this.handleClick.bind(this, term)}
                                    >
                                        {term}
                                    </li>) 
                                }
                                { terms.size < 3 && 
                                    this.defaultTerms().take(3-terms.size)
                                }
                            </ul>
                        }
                    </div>
                    { history.size > 0 &&
                        <div className="chat_search-suggestions_section">
                            <div className="chat_search-suggestions_header">
                                History
                            </div>
                            <ul className="chat_search-suggestions_list">
                            { history.map((term, idx) => 
                                <li key={idx} 
                                        className="chat_search-suggestions_term" 
                                        onClick={this.handleClick.bind(this, term)}
                                    >
                                        {term}
                                    </li>) 
                            }
                            </ul>
                        </div>
                    }
                </div>
            </Dropdown>
        );
    }
}

function mapStateToProps(state) {
    let app = new App(state);
    let roomPage = new RoomPage(state);
    return {    
        isActive: app.isActiveDropdown("chat-search-suggestions"),
        terms: roomPage.get('searchSuggestions'),
        isFetching: roomPage.get('searchSuggestionsFetching'),
        hasFetched: roomPage.get('searchSuggestionsHasFetched'),
        history: roomPage.get('searchHistory') || List(),
    }
}

export default connect(mapStateToProps)(ChatSearchSuggestions);