import React from 'react'
import { connect } from 'react-redux'

import { Channel } from '../models'
import { loadChannel, clearChannel } from '../actions'

class Category extends React.Component {

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

    render() {
        const { channel } = this.props;
        return (
            <div className="category">
                { channel.get('name') }
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
