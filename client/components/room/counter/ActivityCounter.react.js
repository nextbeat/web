import React from 'react'
import { connect } from 'react-redux'

import CounterInner from './CounterInner.react'

import { selectDetailSection } from '../../../actions'

class ActivityCounter extends React.Component {

    constructor(props) {
        super(props);
        
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        this.props.dispatch(selectDetailSection('activity'))
    }

    render() {
        const { room } = this.props;
        return (
            <div className="player_hover-button player_counter active" onClick={this.handleClick}>
                <CounterInner room={room} />
            </div>
        )
    }
}

export default connect()(ActivityCounter);
