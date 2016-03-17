import React from 'react'
import { connect } from 'react-redux'

import { Tag } from '../models'
import { loadTag, clearTag, loadStacksForTag } from '../actions'
import StackItem from './shared/StackItem.react'
import Spinner from './shared/Spinner.react'

class TagComponent extends React.Component {

    constructor(props) {
        super(props)

        this.setSort = this.setSort.bind(this)
        this.renderTag = this.renderTag.bind(this)
    }

    componentDidMount() {
        const { params: { name }, dispatch } = this.props
        dispatch(loadTag(name))
    }

    componentWillUnmount() {
        this.props.dispatch(clearTag())
    }

    componentDidUpdate(prevProps) {
        if (prevProps.params.name !== this.props.params.name) {
            this.props.dispatch(clearTag())
            this.props.dispatch(loadTag(this.props.params.name))
        }
    }

    // Render

    setSort(type) {
        this.props.dispatch(loadStacksForTag({ sort: type }))
    }

    renderRooms(tag) {
        if (tag.stacks().size === 0) {
            return <div className="Tag_no-content">Looks like we couldn't find any rooms here!</div>
        }
        return tag.stacks().map(stack => <StackItem key={`s${stack.get('id')}`} stack={stack} />) 
    }

    renderTag() {
        const { tag } = this.props;
        const selected = type => tag.get('sort') === type ? "selected" : ""
        return (
            <div>
                <div className="tag_header">
                    { tag.get('name') }
                </div>
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
        const { tag } = this.props
        return (
            <div className="tag content">
                { tag.get('isFetching') && <Spinner type="grey large tag" /> }
                { !tag.get('isFetching') && !tag.get('error') && this.renderTag() }
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
