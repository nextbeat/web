import React from 'react'

import CounterInner from './CounterInner.react'

class Counter extends React.Component {

    render() {
        const { room } = this.props;
        return (
            <div className="player_hover-button player_counter">
                <CounterInner room={room} />
            </div>
        )
    }
}

export default Counter;
