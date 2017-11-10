import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Dropdown from '@components/shared/Dropdown'
import RoomPage from '@models/state/pages/room'
import { promptModal } from '@actions/app'
import { State, DispatchProps } from '@types'

interface OwnProps {
    type: string
}

interface ConnectProps {
    hid: string
    closed: boolean
}

type Props = OwnProps & ConnectProps & DispatchProps

class ActionsDropdown extends React.Component<Props> {

    render() {
        const { dispatch, hid, closed, type } = this.props
        return (
            <Dropdown type={`stack-actions-${type}`} triangleMargin={-1}>
                <Link to={`/r/${hid}/edit`} className="dropdown-option">Edit Room</Link>
                { !closed && <a className="dropdown-option" onClick={() => {dispatch(promptModal('close-room'))}}>Close Room</a> }
                <a className="dropdown-option" onClick={() => {dispatch(promptModal('delete-room'))}}>Delete Room</a>
            </Dropdown>
        )
    }

}

function mapStateToProps(state: State): ConnectProps { 
    return {
        hid: RoomPage.entity(state).get('hid'),
        closed: RoomPage.status(state) === 'closed'
    }
}

export default connect(mapStateToProps)(ActionsDropdown)