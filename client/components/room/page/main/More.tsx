import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import LargeStackItem from '@components/shared/LargeStackItem'
import RoomPage from '@models/state/pages/room'
import Stack from '@models/entities/stack'
import { State } from '@types'

interface Props {
    moreStacks: List<Stack>
}

class More extends React.Component<Props> {
    render() {
        const { moreStacks } = this.props        
        return (
            <div className="player_more">
                <div className="player_header">MORE LIKE THIS</div>
                <div className="player_rooms">
                { moreStacks.map(stack => <LargeStackItem key={`m${stack.get('id')}`} stack={stack} />) }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: State): Props {
    return {
        moreStacks: RoomPage.moreStacks(state)
    }
}

export default connect(mapStateToProps)(More)
