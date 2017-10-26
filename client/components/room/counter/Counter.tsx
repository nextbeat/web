import * as React from 'react'

import CounterInner from './CounterInner'

interface Props {
    roomId: number
}

class Counter extends React.Component<Props> {

    render() {
        const { roomId } = this.props;
        return (
            <div className="player_counter">
                <CounterInner roomId={roomId} />
            </div>
        )
    }
}

export default Counter;
