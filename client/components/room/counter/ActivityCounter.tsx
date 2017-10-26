import * as React from 'react'
import { connect } from 'react-redux'

import CounterInner from './CounterInner'

import { selectDetailSection } from '@actions/pages/room'
import { DispatchProps } from '@types'

interface Props {
    roomId: number
}

type AllProps = Props & DispatchProps

class ActivityCounter extends React.Component<AllProps> {

    constructor(props: AllProps) {
        super(props);
        
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        this.props.dispatch(selectDetailSection('activity'))
    }

    render() {
        const { roomId } = this.props;
        return (
            <div className="player_hover-button player_counter active" onClick={this.handleClick}>
                <CounterInner roomId={roomId} />
            </div>
        )
    }
}

export default connect()(ActivityCounter);
