import * as React from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'

import Modal from '@components/shared/Modal'
import CurrentUser from '@models/state/currentUser'
import App from '@models/state/app'
import RoomPage from '@models/state/pages/room'
import { banUser, unbanUser } from '@actions/room'
import { mentionUser } from '@actions/pages/room'
import { closeModal } from '@actions/app'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    username: string
    roomId: number
    isCurrentUserAuthor: boolean
    isUserBanned: boolean
    isUserCurrentUser: boolean
}

type Props = ConnectProps & DispatchProps

class UserActions extends React.Component<Props> {

    constructor(props: Props) {
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
        const { dispatch, username, roomId, isUserBanned } = this.props 
        dispatch(closeModal())
        if (isUserBanned) {
            dispatch(unbanUser(roomId, username))
        } else {
            dispatch(banUser(roomId, username))
        }
    }


    // Render

    render() {
        const { isCurrentUserAuthor, isUserBanned, isUserCurrentUser, username } = this.props

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
                { isCurrentUserAuthor && !isUserCurrentUser && 
                    <div className="modal-action_btn btn" onClick={this.handleUpdateBanStatus}>
                    { isUserBanned ? "Unban" : "Ban" }
                    </div>
                }
            </Modal>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    const username = RoomPage.get(state, 'selectedChatUsername')
    return {
        username,
        roomId: RoomPage.get(state, 'id'),
        isCurrentUserAuthor: RoomPage.isCurrentUserAuthor(state),
        isUserBanned: RoomPage.isUserBanned(state, username),
        isUserCurrentUser: CurrentUser.entity(state).get('username') === username
    }
}

export default connect(mapStateToProps)(UserActions);
