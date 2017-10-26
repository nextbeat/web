import * as React from 'react'
import { connect } from 'react-redux'

import Room from '@models/state/room'
import { State } from '@types'

interface OwnProps {
    roomId: number
}

interface ConnectProps {
    index: number
    count: number
}

class CounterInner extends React.Component<OwnProps & ConnectProps> {

    render() {
        const { index, count } = this.props;

        return (
            <div>
                <span className="selected">{index}</span><span className="player_counter-separator">/</span>{count} 
            </div>
        )
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        index: Room.indexOfSelectedMediaItem(state, ownProps.roomId) + 1 || 1,
        count: Room.mediaItemsSize(state, ownProps.roomId) || Room.entity(state, ownProps.roomId).get('mediaitem_count')
    }
}

export default connect(mapStateToProps)(CounterInner);
