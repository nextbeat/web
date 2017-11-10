import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'
import range from 'lodash-es/range'

import Dropdown from '@components/shared/Dropdown'
import Spinner from '@components/shared/Spinner'
import App from '@models/state/app'
import RoomPage from '@models/state/pages/room'
import { getSearchSuggestions, searchChat } from '@actions/pages/room'
import { closeDropdown } from '@actions/app'
import { State, DispatchProps } from '@types'

const numSearchSuggestions = RoomPage.NUM_SEARCH_SUGGESTIONS;

interface ConnectProps {
    isActive: boolean
    terms: List<string>
    isFetching: boolean
    hasFetched: boolean
    history: List<string>
}

type Props = ConnectProps & DispatchProps

class ChatSearchSuggestions extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(term: string) {
        const { dispatch } = this.props
        dispatch(searchChat(term, true));
        dispatch(closeDropdown('chat-search-suggestions'));
    }

    componentWillReceiveProps(nextProps: Props) {
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
                has:response
            </li>,
            <li key={3} {...attrs}>
                @<span className="chat_search-suggestions_term-default_template">username</span> <span className="chat_search-suggestions_term-default_detail">for mentions</span>
            </li>,
            <li key={4} {...attrs}>
                #<span className="chat_search-suggestions_term-default_template">tag</span>
            </li>
        ]).take(numSearchSuggestions);
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
                            <Spinner key="spinner" styles={["grey"]} />,
                            <ul key="list" className="chat_search-suggestions_list">
                                { /* Fills out section to proper height */ }
                                { range(numSearchSuggestions).map(idx => <li key={idx} className="chat_search-suggestions_term chat_search-suggestions_term-dummy">foo</li>) }
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
                                { terms.size < numSearchSuggestions && 
                                    this.defaultTerms().take(numSearchSuggestions-terms.size)
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

function mapStateToProps(state: State): ConnectProps {
    return {    
        isActive: App.isActiveDropdown(state, "chat-search-suggestions"),
        terms: RoomPage.get(state, 'searchSuggestions'),
        isFetching: RoomPage.get(state, 'searchSuggestionsFetching'),
        hasFetched: RoomPage.get(state, 'searchSuggestionsHasFetched'),
        history: RoomPage.get(state, 'searchHistory', List())
    }
}

export default connect(mapStateToProps)(ChatSearchSuggestions);