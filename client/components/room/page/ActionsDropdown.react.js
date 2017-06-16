import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Dropdown from '../../shared/Dropdown.react'
import { RoomPage } from '../../../models'
import { promptModal } from '../../../actions'

class ActionsDropdown extends React.Component {

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

function mapStateToProps(state) {
    let roomPage = new RoomPage(state)
    return {
        hid: roomPage.get('hid'),
        closed: roomPage.get('closed')
    }
}

export default connect(mapStateToProps)(ActionsDropdown)