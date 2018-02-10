
import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import * as CSSTransition from 'react-transition-group/CSSTransition'

import Icon from '@components/shared/Icon'

import { gaEvent } from '@actions/ga'
import RoomPage from '@models/state/pages/room'
import { State, DispatchProps } from '@types'
import { storageAvailable } from '@utils'

interface ConnectProps {
    username: string
    isClosed: boolean
}

interface OwnProps {
    handleClose: (e: any) => void
}

type Props = ConnectProps & OwnProps & DispatchProps

class WelcomeBanner extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleLearnMoreClick = this.handleLearnMoreClick.bind(this)
        this.renderText = this.renderText.bind(this)
    }

    handleLearnMoreClick() {
        this.props.dispatch(gaEvent({
            category: 'onboarding',
            action: 'click',
            label: 'welcome-banner-learn-more'
        }))
        return true;
    }

    // Render

    renderText() {
        const { username, isClosed } = this.props 
        const openText = <span>{username} will be posting videos here over the next few hours. You can tag @{username} to ask questions and make requests!</span>
        const closedText = <span>This room is now closed, which means {username} is no longer posting new videos. Feel free to stay and catch up! <Link to={`/u/${username}`}>Subscribe to {username}</Link> to make sure you don’t miss the next one.</span>
        return isClosed ? closedText : openText
    }

    render() {

        const { username, isClosed, handleClose } = this.props

        return (
            <div className="room_welcome-banner">
                <div className="room_welcome-banner_text">
                    <b>Welcome to Nextbeat!</b> { this.renderText() }
                </div>
                <div className="room_welcome-banner_buttons">
                    <Link className="room_welcome-banner_button room_welcome-banner_button-about" to="/company/about" target="_blank" onClick={this.handleLearnMoreClick}>
                        LEARN MORE
                    </Link>
                    <div className="room_welcome-banner_close" onClick={handleClose} >
                        <Icon type="close" />
                    </div>
                    <a className="room_welcome-banner_button room_welcome-banner_button-dismiss" onClick={handleClose}>
                        DISMISS
                    </a>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        username: RoomPage.entity(state).author().get('username'),
        isClosed: RoomPage.entity(state).get('closed')
    }
}

export default connect(mapStateToProps)(WelcomeBanner);
