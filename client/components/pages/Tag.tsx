import * as React from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { Map, List } from 'immutable'

import ScrollComponent, { ScrollComponentProps } from '@components/utils/ScrollComponent'
import LargeStackItem from '@components/shared/LargeStackItem'
import Spinner from '@components/shared/Spinner'
import Icon from '@components/shared/Icon'
import AppBanner from '@components/shared/AppBanner'

import Tag from '@models/state/pages/tag'
import Stack from '@models/entities/stack'
import { loadTag, clearTag, loadStacksForTag, TagFilterOptions } from '@actions/pages/tag'
import { Store, State, DispatchProps, RouteProps, ServerRenderingComponent, staticImplements } from '@types'

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

interface ConnectProps {
    stacksFetching: boolean
    stacks: List<Stack>
    sort: string
    filters: State
}

interface Params {
    name: string
}

type Props = ConnectProps & DispatchProps & RouteProps<Params> & ScrollComponentProps

@staticImplements<ServerRenderingComponent>()
class TagComponent extends React.Component<Props> {

    static fetchData(store: Store, params: Params) {
        return new Promise((resolve, reject) => {
    
            const unsubscribe = store.subscribe(() => {
                    if (Tag.isLoaded(store.getState())) {
                        unsubscribe()
                        resolve(store)
                    }
                    if (!!Tag.get(store.getState(), 'error')) {
                        unsubscribe()
                        reject(new Error('Tag does not exist.'))
                    }
                })
            store.dispatch(loadTag(params.name))
        })
    }

    constructor(props: Props) {
        super(props)

        this.load = this.load.bind(this);
        this.setSort = this.setSort.bind(this)
        this.setTimeFilter = this.setTimeFilter.bind(this)
        this.renderTag = this.renderTag.bind(this)
        this.renderFilters = this.renderFilters.bind(this)
        this.renderRooms = this.renderRooms.bind(this)
    }

    componentDidMount() {
        this.load();
    }

    componentWillUnmount() {
        this.props.dispatch(clearTag())
    }

    componentDidUpdate(prevProps: Props) {
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

    setSort(type: string) {
        const { dispatch, params: { name }} = this.props
        dispatch(loadStacksForTag(name, { sort: type }))
    }

    setTimeFilter(options: TagFilterOptions) {
        const { dispatch, params: { name }} = this.props
        dispatch(loadStacksForTag(name, options))
        $('.tag_dropdown').hide()
    }

    // Render

    renderRooms() {
        const { stacksFetching, stacks } = this.props
        if (!stacksFetching && stacks.size === 0) {
            return <div className="tag_no-content">Looks like we couldn't find any rooms here!</div>
        }
        return stacks.map(stack => <LargeStackItem key={`s${stack.get('id')}`} stack={stack} />) 
    }

    renderTag() {
        const { sort, stacksFetching } = this.props
        const selectedSort = (type: string) => sort === type ? "selected" : ""
        return (
            <div>   
                <div className="filters">
                    { SORT_TYPES.map(sort => 
                        <span key={`sort${sort.name}`} className={`filter ${selectedSort(sort.name)}`} onClick={this.setSort.bind(this, sort.name)}>{sort.display}</span>
                    )}
                </div>
                <div className="tag_stacks">
                    { this.renderRooms() }
                    { stacksFetching && <Spinner styles={["grey"]} type="tag-rooms" /> }
                </div>
            </div>
        )
    }

    renderFilters() {
        const { filters } = this.props 
        const selectedFilter = FILTER_TYPES.filter(filter => Map(filter.query).isSubset(filters as any)).shift()
        const otherFilters = FILTER_TYPES.filter(filter => filter !== selectedFilter)
        return (
            <div className="tag_times">
                <a onClick={() => { $('.tag_dropdown').toggle() }}>{ selectedFilter && selectedFilter.display } <Icon type="arrow-drop-down" /></a>
                <div className="tag_dropdown">
                    <ul>
                        { otherFilters.map(filter => <li key={`filter${filter.display}`} onClick={this.setTimeFilter.bind(this, filter.query)}>{filter.display}</li>) }
                    </ul>
                </div>
            </div>
        )
    }

    render() {
        const { params: { name } } = this.props
        return (
            <div className="tag content" id="tag">
                <Helmet 
                    title={name}
                    meta={[
                        {"property": "al:ios:url", "content": `nextbeat://tags/${name}`}
                    ]}
                />
                <AppBanner url={`nextbeat://tags/${name}`}/>
                <div className="content_inner tag_inner">
                    <div className="tag_header">
                        { name }
                    </div>
                    { this.renderFilters() }
                    { this.renderTag() }
                </div>
            </div>
        );
    }

}

function mapStateToProps(state: State): ConnectProps {
    return {
        stacksFetching: Tag.get(state, 'stacksFetching'),
        stacks: Tag.stacks(state),
        sort: Tag.get(state, 'sort'),
        filters: Tag.get(state, 'filters')
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
