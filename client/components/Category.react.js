import React from 'react'
import { connect } from 'react-redux'

import { Channel } from '../models'
import { loadChannel, clearChannel, loadStacksForChannel } from '../actions'
import StackItem from './shared/StackItem.react'

class Category extends React.Component {

    constructor(props) {
        super(props)

        this.setSort = this.setSort.bind(this)
    }

    componentDidMount() {
        const { params: { name }, dispatch } = this.props
        dispatch(loadChannel(name))
    }

    componentWillUnmount() {
        this.props.dispatch(clearChannel())
    }

    componentDidUpdate(prevProps) {
        if (prevProps.params.name !== this.props.params.name) {
            this.props.dispatch(clearChannel())
            this.props.dispatch(loadChannel(this.props.params.name))
        }
    }

    setSort(type) {
        this.props.dispatch(loadStacksForChannel({ sort: type }))
    }

    render() {
        const { channel } = this.props
        const selected = type => channel.get('sort') === type ? "selected" : ""
        return (
            <div className="category content">
                <div className="category_header">
                    { channel.get('name') }
                </div>
                <div className="category_filters">
                    <span className={`category_filter ${selected("hot")}`} onClick={this.setSort.bind(this, "hot")}>Hot</span>
                    <span className={`category_filter ${selected("new")}`} onClick={this.setSort.bind(this, "new")}>New</span>
                </div>
                <div className="category_stacks">
                    { channel.stacks().map(stack => <StackItem key={`s${stack.get('id')}`} stack={stack} />) }
                </div>
            </div>
        );
    }

}

function mapStateToProps(state) {
    return {
        channel: new Channel(state)
    }
}

export default connect(mapStateToProps)(Category);
