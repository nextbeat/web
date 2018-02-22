import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Dropdown from '@components/shared/Dropdown'
import Icon from '@components/shared/Icon'
import SmallLogo from '@components/shared/SmallLogo'
import Subscribe from '@components/shared/Subscribe'
import OpenInAppComponent, { OpenProps } from '@components/utils/OpenInAppComponent'

import RoomPage from '@models/state/pages/room'
import App from '@models/state/app'
import CurrentUser from '@models/state/currentUser'
import UserEntity from '@models/entities/user'
import { toggleDropdown, promptModal, closeDropdown } from '@actions/app'
import { logout } from '@actions/user'

import { State, DispatchProps } from '@types'

interface ConnectProps {
    hid: string
    author: UserEntity
    isIOS: boolean

    isLoggedIn: boolean
    username: string
}

type Props = ConnectProps & DispatchProps & OpenProps

class RoomTopbar extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleOpenInAppClick = this.handleOpenInAppClick.bind(this)
        this.handleOptionsClick = this.handleOptionsClick.bind(this)
        this.handleLogoutClick = this.handleLogoutClick.bind(this)
        this.handleLoginClick = this.handleLoginClick.bind(this)
        this.handleSignupClick = this.handleSignupClick.bind(this)

        this.renderDropdown = this.renderDropdown.bind(this)
    }

    handleOpenInAppClick(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault()

        const { openInApp, hid } = this.props

        const url = `nextbeat://rooms/${hid}`
        openInApp(url)
    }

    handleOptionsClick(e: React.MouseEvent<HTMLElement>) {
        e.stopPropagation()
        this.props.dispatch(toggleDropdown('room-options'))
    }   

    handleLogoutClick(e: React.MouseEvent<HTMLElement>) {
        e.stopPropagation()
        this.props.dispatch(logout())
        this.props.dispatch(closeDropdown('room-options'))
    }

    handleLoginClick(e: React.MouseEvent<HTMLElement>) {
        e.stopPropagation()
        this.props.dispatch(promptModal('login'))
        this.props.dispatch(closeDropdown('room-options'))
    }

    handleSignupClick(e: React.MouseEvent<HTMLElement>) {
        e.stopPropagation()
        this.props.dispatch(promptModal('signup'))
        this.props.dispatch(closeDropdown('room-options'))
    }

    renderDropdown() {
        const { isLoggedIn, username } = this.props

        return (
            <Dropdown type="room-options">
                { isLoggedIn &&
                    <div>
                        <Link className="dropdown-option" to="/search">Search</Link>
                        <Link className="dropdown-option" to="/upload">Upload</Link>
                        <Link className="dropdown-option" to={`/u/${username}`}>Profile</Link>
                        <a className="dropdown-option" onClick={this.handleLogoutClick}>Log Out</a>
                    </div>
                }
                { !isLoggedIn &&
                    <div>
                        <a className="dropdown-option" onClick={this.handleLoginClick}>Log In</a>
                        <a className="dropdown-option dropdown-option-signup" onClick={this.handleSignupClick}>Sign Up</a>
                    </div>
                }
            </Dropdown>
        )
    }

    render() {
        const { author, isIOS } = this.props;
        return (
            <div className="topbar room_topbar">
                <div className="room_topbar_left">
                    <div className="room_topbar_logo"><Link to="/"><SmallLogo /></Link></div>
                    <div className="room_topbar_user">
                        <Link className="room_topbar_username" to={`/u/${author.get('username')}`}>{author.get('username')}</Link>
                        <Subscribe user={author} />
                    </div>
                </div>
                <div className="room_topbar_right">
                    { isIOS && <div className="room_topbar_open" onClick={this.handleOpenInAppClick}>Open in app</div> }
                    <div className="room_topbar_options" onClick={this.handleOptionsClick}>
                        <Icon type="more-vert" />
                    </div>
                </div>
                { this.renderDropdown() }
            </div>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        hid: RoomPage.entity(state).get('hid'),
        author: RoomPage.entity(state).author(),
        isIOS: App.isIOS(state),

        isLoggedIn: CurrentUser.isLoggedIn(state),
        username: CurrentUser.entity(state).get('username'),
    }
}

export default connect(mapStateToProps)(OpenInAppComponent(RoomTopbar));