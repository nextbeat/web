import * as React from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'

import Modal from '@components/shared/Modal'
import CurrentUser from '@models/state/currentUser'
import App from '@models/state/app'
import RoomPage from '@models/state/pages/room'
import { roomBan, roomUnban } from '@actions/room'
import { mentionUser } from '@actions/pages/room'
import { creatorBan, creatorUnban, mod, unmod } from '@actions/user'
import { closeModal } from '@actions/app'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    username: string
    roomId: number
    creatorId: number

    isCurrentUserAuthor: boolean
    isCurrentUserModerator: boolean
    isUserCurrentUser: boolean

    isUserRoomBanned: boolean
    isUserCreatorBanned: boolean
    isUserModerator: boolean
}

type Props = ConnectProps & DispatchProps

class UserActions extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleGoToProfile = this.handleGoToProfile.bind(this);
        this.handleMention = this.handleMention.bind(this);
        this.handleRoomBan = this.handleRoomBan.bind(this);
        this.handleCreatorBan = this.handleCreatorBan.bind(this);
        this.handleMod = this.handleMod.bind(this);
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

    handleRoomBan() {
        const { dispatch, username, roomId, isUserRoomBanned } = this.props 

        dispatch(closeModal())
        if (isUserRoomBanned) {
            dispatch(roomUnban(roomId, username))
        } else {
            dispatch(roomBan(roomId, username))
        }
    }

    handleCreatorBan() {
        const { dispatch, username, roomId, creatorId, isUserCreatorBanned } = this.props 

        dispatch(closeModal())
        if (isUserCreatorBanned) {
            dispatch(creatorUnban(creatorId, username, roomId))
        } else {
            dispatch(creatorBan(creatorId, username, roomId))
        }
    }

    handleMod() {
        const { dispatch, username, roomId, creatorId, isUserModerator } = this.props 

        dispatch(closeModal())
        if (isUserModerator) {
            dispatch(unmod(creatorId, username, roomId))
        } else {
            dispatch(mod(creatorId, username, roomId))
        }
    }


    // Render

    render() {
        const { username, isCurrentUserAuthor, isCurrentUserModerator, isUserCurrentUser, 
                isUserRoomBanned, isUserCreatorBanned, isUserModerator } = this.props

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
                { (isCurrentUserModerator || isCurrentUserAuthor) && !isUserCurrentUser && !isUserModerator && !isUserCreatorBanned &&
                    <div className="modal-action_btn btn" onClick={this.handleRoomBan}>
                        { isUserRoomBanned ? "Remove ban from room" : "Ban from room" }
                    </div>
                }
                { (isCurrentUserModerator || isCurrentUserAuthor) && !isUserCurrentUser && !isUserModerator &&
                    <div className="modal-action_btn btn" onClick={this.handleCreatorBan}>
                        { isUserCreatorBanned ? "Remove permaban" : "Permaban" }
                    </div>
                }
                { isCurrentUserAuthor && !isUserCurrentUser && !isUserRoomBanned && !isUserCreatorBanned &&
                    <div className="modal-action_btn btn" onClick={this.handleMod}>
                        { isUserModerator ? "Unmod" : "Mod" }
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
        creatorId: RoomPage.author(state).get('id'),
        
        isCurrentUserAuthor: RoomPage.isCurrentUserAuthor(state),
        isCurrentUserModerator: RoomPage.isCurrentUserModerator(state),
        isUserCurrentUser: CurrentUser.entity(state).get('username') === username,

        isUserRoomBanned: RoomPage.isUserRoomBanned(state, username),
        isUserCreatorBanned: RoomPage.isUserCreatorBanned(state, username),
        isUserModerator: RoomPage.isUserModerator(state, username)
    }
}

export default connect(mapStateToProps)(UserActions);
