import React from 'react'
import { connect } from 'react-redux'

import { Tag } from '../models'
import { loadTag, clearTag, loadStacksForTag } from '../actions'
import StackItem from './shared/StackItem.react'
import Spinner from './shared/Spinner.react'

class TagComponent extends React.Component {

    constructor(props) {
        super(props)

        this.load = this.load.bind(this);
        this.setSort = this.setSort.bind(this)
        this.renderTag = this.renderTag.bind(this)
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
        const { params: { name }, dispatch } = this.props
        dispatch(loadTag(name))
        this.setSort("hot");
    }

    setSort(type) {
        const { dispatch, params: { name }} = this.props;
        dispatch(loadStacksForTag(name, { sort: type }))
    }

    // Render

    renderRooms(tag) {
        if (tag.stacks().size === 0) {
            return <div className="tag_no-content">Looks like we couldn't find any rooms here!</div>
        }
        return tag.stacks().map(stack => <StackItem key={`s${stack.get('id')}`} stack={stack} />) 
    }

    renderTag() {
        const { tag } = this.props
        const selected = type => tag.get('sort') === type ? "selected" : ""
        return (
            <div>   
                <div className="tag_filters">
                    <span className={`tag_filter ${selected("hot")}`} onClick={this.setSort.bind(this, "hot")}>Hot</span>
                    <span className={`tag_filter ${selected("new")}`} onClick={this.setSort.bind(this, "new")}>New</span>
                </div>
                <div className="tag_stacks">
                    { tag.get('stacksFetching') && <Spinner type="grey tag-rooms" /> }
                    { !tag.get('stacksFetching') && !tag.get('stacksError') && this.renderRooms(tag) }
                       
                </div>
            </div>
        )
    }

    render() {
        const { tag, params: { name } } = this.props
        return (
            <div className="tag content">
                <div className="tag_header">
                    { name }
                </div>
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

export default connect(mapStateToProps)(TagComponent);
