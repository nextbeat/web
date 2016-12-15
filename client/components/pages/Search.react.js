import React from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import Helmet from 'react-helmet'

import { Search } from '../../models'
import { loadSearchResults, clearSearch } from '../../actions'
import Spinner from '../shared/Spinner.react'
import Icon from '../shared/Icon.react'
import User from '../shared/User.react'
import LargeStackItem from '../shared/LargeStackItem.react'
import Badge from '../shared/Badge.react'

const SEARCH_FILTERS = [
    {
        name: 'Rooms',
        searchType: 'stacks' 
    },
    { 
        name: 'People',
        searchType: 'users',
    },
    {
        name: 'Tags',
        searchType: 'tags'
    }
]

class SearchComponent extends React.Component {

    constructor(props) {
        super(props)

        this.selectSearchType = this.selectSearchType.bind(this)

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleInputKeyPress = this.handleInputKeyPress.bind(this)

        this.renderResults = this.renderResults.bind(this)
        this.renderStacks = this.renderStacks.bind(this)
        this.renderUsers = this.renderUsers.bind(this)
        this.renderTags = this.renderTags.bind(this)

        this.state = {
            query: '',
        }
    }

    componentDidMount() {
        const { dispatch, location } = this.props
        const query = location.query.q
        if (query && query.length > 0) {
            this.setState({ query })
            dispatch(loadSearchResults(query, 'stacks'))
        }
    }

    componentWillUnmount() {
        this.props.dispatch(clearSearch())
    }

    componentDidUpdate(prevProps) {
        const { dispatch, location } = this.props
        const query = location.query.q
        if (prevProps.search.get('query') !== query) {
            dispatch(clearSearch())
            this.setState({ query })
            dispatch(loadSearchResults(query, 'stacks'))
        }
    }

    // Actions

    selectSearchType(searchType) {
        const { dispatch, location } = this.props
        const query = location.query.q
        dispatch(loadSearchResults(query, searchType))
    }

    // Events

    handleInputChange(e) {
        this.setState({ query: e.target.value })
    }

    handleInputKeyPress(e) {
        if (e.charCode === 13) {
            browserHistory.push({
                pathname: '/search',
                query: { q: this.state.query }
            })
        }
    }   

    // Render

    renderStacks() {
        const { search } = this.props
        return (
            <div className="search_results">
                { search.get('stacksFetching') && <Spinner type="grey search-results" />}
                { !search.get('stacksFetching') && search.stacks().size === 0 && <span className="search_no-content">No rooms found.</span>}
                <div className="rooms-list_rooms">
                    { search.stacks().map(stack => <LargeStackItem key={stack.get('id')} stack={stack} />)}
                </div>
            </div>
        )
    }

    renderUsers() {
        const { search } = this.props
        return (
            <div className="search_results">
            { search.get('usersFetching') && <Spinner type="grey search-results" />}
            { !search.get('usersFetching') && search.users().size === 0 && <span className="search_no-content">No people found.</span>}
            { search.users().map(u => 
                <div key={`search-u-${u.get('id')}`} className="search_result search_result-user">
                    <User user={u} />
                    { u.get('open_stacks', 0) > 0 && <Badge type="open" elementType="search_result-user">OPEN ROOM</Badge> }
                </div>
            )}
            </div>
        )
    }

    renderTags() {
        const { search } = this.props 
        return (
            <div className="search_results">
            { search.get('tagsFetching') && <Spinner type="grey search-results" />}
            { !search.get('tagsFetching') && search.tags().size === 0 && <span className="search_no-content">No tags found.</span>}
            { search.tags().map(t => 
                <div key={`search-t-${t.get('name')}`} className="search_result search_result-tag">
                    <Link to={`/t/${t.get('name')}`}>{t.get('name')}</Link>
                </div>
            )}
            </div>
        )
    }

    renderResults() {
        const { search } = this.props 
        const selectedFilterClass = f => f.searchType === search.get('searchType') ? 'selected' : ''

        return [
            <div className="filters">
                {SEARCH_FILTERS.map(f => 
                    <span key={f.searchType} className={`filter ${selectedFilterClass(f)}`} onClick={this.selectSearchType.bind(this, f.searchType)}>{f.name}</span>
                )}
            </div>,
            <div>{ search.get('searchType') === 'stacks' && this.renderStacks() }</div>,
            <div>{ search.get('searchType') === 'users' && this.renderUsers() }</div>,
            <div>{ search.get('searchType') === 'tags' && this.renderTags() }</div>
        ]
    }

    render() {
        const { search } = this.props
        return (
            <div className="search content" id="search">
                <Helmet title={search.get('query')} />
                <div className="search_header">
                    <input type="text" placeholder="Search" value={this.state.query} onChange={this.handleInputChange} onKeyPress={this.handleInputKeyPress} className="search_header_input" />
                    <Icon type="search" />
                </div>
                { search.get('query', '').length > 0 && this.renderResults() }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        search: new Search(state)
    }
}

export default connect(mapStateToProps)(SearchComponent);
