import React from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'

import { Search } from '../models'
import { loadSearchResults, clearSearch } from '../actions'

class SearchComponent extends React.Component {

    componentDidMount() {
        const { dispatch, location } = this.props
        const query = location.query.q
        dispatch(loadSearchResults(query, 'users'))
    }

    render() {
        const { search } = this.props
        return (
            <div>Search {search.get('query')}</div>
        );
    }
}

function mapStateToProps(state) {
    return {
        search: new Search(state)
    }
}

export default connect(mapStateToProps)(SearchComponent);
