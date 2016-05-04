import React from 'react'
import { connect } from 'react-redux'
import ScrollComponent from './utils/ScrollComponent.react'
import { Map } from 'immutable'

import { Tag } from '../models'
import { loadTag, clearTag, loadStacksForTag } from '../actions'
import LargeStackItem from './shared/LargeStackItem.react'
import Spinner from './shared/Spinner.react'
import Icon from './shared/Icon.react'

const SORT_TYPES = [
    { name: "hot", display: "Hot" },
    { name: "lastUpdated", display: "New" },
    { name: "bookmarks", display: "Most Bookmarked" },
    { name: "views", display: "Most Viewed" }
]

const FILTER_TYPES = [
    { query: {status: "open", time: "all"}, display: "Open" },
    { query: {status: "all", time: "week"}, display: "Week" },
    { query: {status: "all", time: "month"}, display: "Month" },
    { query: {status: "all", time: "all"}, display: "All Time"}
]

class TagComponent extends React.Component {

    constructor(props) {
        super(props)

        this.load = this.load.bind(this);
        this.setSort = this.setSort.bind(this)
        this.setTimeFilter = this.setTimeFilter.bind(this)
        this.renderTag = this.renderTag.bind(this)
        this.renderFilters = this.renderFilters.bind(this)
    }

    componentDidMount() {
        this.load();
    }

    componentWillUnmount() {
        this.props.dispatch(clearTag())
    }

    componentDidUpdate(prevProps) {
        if (prevProps.params.name !== this.props.params.name) {
            this.props.dispatch(clearTag())
            this.load();
        }
    }

    // Actions

    load() {
        const { dispatch, params: { name }} = this.props
        dispatch(loadTag(name))
        this.setSort("hot");
    }

    setSort(type) {
        const { dispatch, params: { name }} = this.props
        dispatch(loadStacksForTag(name, { sort: type }))
    }

    setTimeFilter(options) {
        const { dispatch, params: { name }} = this.props
        dispatch(loadStacksForTag(name, options))
        $('.tag_dropdown').hide()
    }

    // Render

    renderRooms(tag) {
        if (!tag.get('stacksFetching') && tag.stacks().size === 0) {
            return <div className="tag_no-content">Looks like we couldn't find any rooms here!</div>
        }
        return tag.stacks().map(stack => <LargeStackItem key={`s${stack.get('id')}`} stack={stack} />) 
    }

    renderTag() {
        const { tag } = this.props
        const selectedSort = type => tag.get('sort') === type ? "selected" : ""
        return (
            <div>   
                <div className="tag_filters">
                    { SORT_TYPES.map(sort => 
                        <span key={`sort${sort.name}`} className={`tag_filter ${selectedSort(sort.name)}`} onClick={this.setSort.bind(this, sort.name)}>{sort.display}</span>
                    )}
                </div>
                <div className="tag_stacks">
                    { this.renderRooms(tag) }
                    { tag.get('stacksFetching') && <Spinner type="grey tag-rooms" /> }
                </div>
            </div>
        )
    }

    renderFilters() {
        const { tag } = this.props 
        const selectedFilter = FILTER_TYPES.filter(filter => Map(filter.query).isSubset(tag.get('filters'))).shift()
        const otherFilters = FILTER_TYPES.filter(filter => filter !== selectedFilter)
        return (
            <div className="tag_times">
                <a onClick={() => { $('.tag_dropdown').toggle() }}>{ selectedFilter.display } <Icon type="arrow-drop-down" /></a>
                <div className="tag_dropdown">
                    <ul>
                        { otherFilters.map(filter => <li key={`filter${filter.display}`} onClick={this.setTimeFilter.bind(this, filter.query)}>{filter.display}</li>) }
                    </ul>
                </div>
            </div>
        )
    }

    render() {
        const { tag, params: { name } } = this.props
        return (
            <div className="tag content" id="tag">
                <div className="tag_header">
                    { name }
                </div>
                { this.renderFilters() }
                { this.renderTag() }
            </div>
        );
    }

}

function mapStateToProps(state) {
    return {
        tag: new Tag(state)
    }
}

const scrollOptions = {

    onScrollToBottom: function() {
        const { tag, dispatch, params: { name } } = this.props 
        if (!tag.get('stacksFetching') && tag.stacks().size > 0) {
            dispatch(loadStacksForTag(name))
        }
    }
}

export default connect(mapStateToProps)(ScrollComponent('tag', scrollOptions)(TagComponent));
