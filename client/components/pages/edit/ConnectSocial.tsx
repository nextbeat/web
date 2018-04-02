import * as React from 'react'
import { connect } from 'react-redux'

import { getCurrentUser, revokeSocialAccount } from '@actions/user'
import CurrentUser from '@models/state/currentUser'
import { UserSocial } from '@models/entities/user'
import { baseUrl } from '@utils'
import { State, DispatchProps } from '@types'

interface OwnProps {
    platform: string
    displayName: string
}

interface ConnectProps {
    social?: UserSocial
}

type Props = OwnProps & ConnectProps & DispatchProps

class ConnectSocial extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleReceiveMessage = this.handleReceiveMessage.bind(this)
        this.handleConnectClick = this.handleConnectClick.bind(this)
        this.handleDisconnectClick = this.handleDisconnectClick.bind(this)
    }

    componentDidMount() {
        window.addEventListener('message', this.handleReceiveMessage)
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.handleReceiveMessage)
    }

    handleReceiveMessage(e: MessageEvent) {
        if (e.origin !== window.location.origin) {
            return
        }

        this.props.dispatch(getCurrentUser())
    } 

    handleConnectClick() {
        const { platform } = this.props
        const url = `${baseUrl()}/api/social/${platform}/auth`
        window.open(url, '_blank', 'toolbar=0,location=0,menubar=0,width=700,height=600')
    }

    handleDisconnectClick() {
        const { dispatch, platform } = this.props
        dispatch(revokeSocialAccount(platform))
    }

    render() {
        const { platform, displayName, social } = this.props
        return (
            <div className="edit_form-item edit_form-item-social">
                <label><div className={`edit_form_social_icon edit_form_social_icon-${platform}`} /></label>
                { social &&
                    <div style={{ display: 'inline-block' }}>
                        <a href={social.get('channel_url')} className="edit_form_social_text">{social.get('channel_name')}</a>
                        <div className="edit_form_social_action" onClick={this.handleDisconnectClick}>Disconnect</div>
                    </div>
                }
                { !social &&
                    <div className="edit_form_social_text" onClick={this.handleConnectClick}>Connect {displayName} Account</div>
                }
            </div>
        )
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        social: CurrentUser.entity(state).social(ownProps.platform)
    }
}

export default connect(mapStateToProps)(ConnectSocial)