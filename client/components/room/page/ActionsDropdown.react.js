import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Dropdown from '../../shared/Dropdown.react'
import { RoomPage } from '../../../models'
import { promptModal } from '../../../actions'

class ActionsDropdown extends React.Component {

    render() {
        const { dispatch, roomPage, type } = this.props
        return (
            <Dropdown type={`stack-actions-${type}`} triangleMargin={-1}>
                <Link to={`/r/${roomPage.get('hid')}/edit`} className="dropdown-option">Edit Room</Link>
                { !roomPage.get('closed') && <a className="dropdown-option" onClick={() => {dispatch(promptModal('close-room'))}}>Close Room</a> }
                <a className="dropdown-option" onClick={() => {dispatch(promptModal('delete-room'))}}>Delete Room</a>
            </Dropdown>
        )
    }

}

function mapStateToProps(state) {
    return {
        roomPage: new RoomPage(state)
    }
}

export default connect(mapStateToProps)(ActionsDropdown)