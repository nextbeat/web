import * as React from 'react'
import { connect } from 'react-redux'

import RoomPage from '@models/state/pages/room'
import UserEntity from '@models/entities/user'

import { State, DispatchProps } from '@types'

interface ConnectProps {
    author: UserEntity
}

type Props = ConnectProps & DispatchProps

class RoomTopbar extends React.Component<Props> {

    render() {
        return (
            <div className="topbar room_topbar">
            </div>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    const roomId = RoomPage.get(state, 'id')
    return {
        author: RoomPage.entity(state).author()
    }
}

export default connect(mapStateToProps)(RoomTopbar);