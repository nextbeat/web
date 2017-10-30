import * as React from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import Helmet from 'react-helmet'
import { List } from 'immutable'

import Spinner from '@components/shared/Spinner'
import Icon from '@components/shared/Icon'
import User from '@components/shared/User'
import LargeStackItem from '@components/shared/LargeStackItem'
import Badge from '@components/shared/Badge'

import Search, { SearchType } from '@models/state/pages/search'
import Stack from '@models/entities/stack'
import UserModel from '@models/entities/user'
import { loadSearchResults, clearSearch } from '@actions/pages/search'
import { State, DispatchProps, RouteProps } from '@types'

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

interface ConnectProps {
    query: string
    searchType: SearchType

    stacksFetching: boolean
    stacks: List<Stack>
    usersFetching: boolean
    users: List<UserModel>
    tagsFetching: boolean
    tags: List<State>
}

type Props = ConnectProps & DispatchProps & RouteProps<{}>

interface ComponentState {
    query: string
}

class SearchComponent extends React.Component<Props, ComponentState> {

    constructor(props: Props) {
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

    componentDidUpdate(prevProps: Props) {
        const { dispatch, location } = this.props
        const query = location.query.q
        if (query && prevProps.query !== query) {
            dispatch(clearSearch())
            this.setState({ query })
            dispatch(loadSearchResults(query, 'stacks'))
        }
    }

    // Actions

    selectSearchType(searchType: SearchType) {
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
            e.preventDefault();
            browserHistory.replace({
                pathname: '/search',
                query: { q: this.state.query }
            })
        }
    }   

    // Render

    renderStacks() {
        const { stacksFetching, stacks } = this.props
        return (
            <div className="search_results">
                { stacksFetching && <Spinner type="search-results" styles={["grey"]} />}
                { !stacksFetching && stacks.size === 0 && <span className="search_no-content">No rooms found.</span>}
                <div className="rooms-list_rooms">
                    { stacks.map(stack => <LargeStackItem key={stack.get('id')} stack={stack} />)}
                </div>
            </div>
        )
    }

    renderUsers() {
        const { usersFetching, users } = this.props
        return (
            <div className="search_results">
            { usersFetching && <Spinner type="search-results" styles={["grey"]} />}
            { !usersFetching && users.size === 0 && <span className="search_no-content">No people found.</span>}
            { users.map(u => 
                <div key={`search-u-${u.get('id')}`} className="search_result search_result-user">
                    <User user={u} />
                    { u.get('open_stacks', 0) > 0 && <Badge type="open" elementType="search_result-user">OPEN ROOM</Badge> }
                </div>
            )}
            </div>
        )
    }

    renderTags() {
        const { tagsFetching, tags } = this.props 
        return (
            <div className="search_results">
            { tagsFetching && <Spinner type="search-results" styles={["grey"]} />}
            { !tagsFetching && tags.size === 0 && <span className="search_no-content">No tags found.</span>}
            { tags.map(t => 
                <div key={`search-t-${t.get('name')}`} className="search_result search_result-tag">
                    <Link to={`/t/${t.get('name')}`}>{t.get('name')}</Link>
                </div>
            )}
            </div>
        )
    }

    renderResults() {
        const { searchType } = this.props 
        const selectedFilterClass = (f: any) => f.searchType === searchType ? 'selected' : ''

        return [
            <div className="filters">
                {SEARCH_FILTERS.map(f => 
                    <span key={f.searchType} className={`filter ${selectedFilterClass(f)}`} onClick={this.selectSearchType.bind(this, f.searchType)}>{f.name}</span>
                )}
            </div>,
            <div>{ searchType === 'stacks' && this.renderStacks() }</div>,
            <div>{ searchType === 'users' && this.renderUsers() }</div>,
            <div>{ searchType === 'tags' && this.renderTags() }</div>
        ]
    }

    render() {
        const { query } = this.props
        return (
            <div className="search content" id="search">
                <Helmet title={query} />
                <form action="#" onSubmit={() => false}>
                <div className="search_header">
                    <input type="search" placeholder="Search" value={this.state.query} onChange={this.handleInputChange} onKeyPress={this.handleInputKeyPress} className="search_header_input" />
                    <Icon type="search" />
                </div>
                </form>
                { query.length > 0 && this.renderResults() }
            </div>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        query: Search.get(state, 'query', ''),
        searchType: Search.get(state, 'searchType'),

        stacksFetching: Search.get(state, 'stacksFetching'),
        stacks: Search.stacks(state),
        usersFetching: Search.get(state, 'usersFetching'),
        users: Search.users(state),
        tagsFetching: Search.get(state, 'tagsFetching'),
        tags: Search.tags(state)
    }
}

export default connect(mapStateToProps)(SearchComponent);
