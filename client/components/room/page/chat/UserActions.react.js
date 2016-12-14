import React from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'

import Modal from '../../../shared/Modal.react'
import { CurrentUser, Stack, RoomPage } from '../../../../models'
import { closeModal, mentionUser, banUser, unbanUser } from '../../../../actions'

class UserActions extends React.Component {

    constructor(props) {
        super(props)

        this.handleGoToProfile = this.handleGoToProfile.bind(this);
        this.handleMention = this.handleMention.bind(this);
        this.handleUpdateBanStatus = this.handleUpdateBanStatus.bind(this);
    }


    // Actions

    handleMention() {
        const { dispatch, username } = this.props 
        dispatch(closeModal())
        dispatch(mentionUser(username))
    }

    handleGoToProfile() {
        const { dispatch, username } = this.props 
        dispatch(closeModal())
        browserHistory.push(`/u/${username}`)
    }

    handleUpdateBanStatus() {
        const { dispatch, username, roomPage } = this.props 
        dispatch(closeModal())
        if (roomPage.userIsBanned(username)) {
            dispatch(unbanUser(username))
        } else {
            dispatch(banUser(username))
        }
    }


    // Render

    render() {
        const { currentUser, username, roomPage } = this.props

        return (
            <Modal name="chat-user-actions" className="modal-action">
                <div className="modal_header">
                    {username}
                </div>
                <div className="modal-action_btn btn btn-gray" onClick={this.handleGoToProfile}>
                    Go To Profile
                </div>
                <div className="modal-action_btn btn btn-gray" onClick={this.handleMention}>
                    Mention
                </div>
                { roomPage.currentUserIsAuthor() && currentUser.get('username') !== username && 
                    <div className="modal-action_btn btn" onClick={this.handleUpdateBanStatus}>
                    { roomPage.userIsBanned(username) ? "Unban" : "Ban" }
                    </div>
                }
            </Modal>
        );
    }
}

function mapStateToProps(state) {
    let roomPage = new RoomPage(state)
    return {
        currentUser: new CurrentUser(state),
        roomPage,
        username: roomPage.get('selectedChatUsername')
    }
}

export default connect(mapStateToProps)(UserActions);
