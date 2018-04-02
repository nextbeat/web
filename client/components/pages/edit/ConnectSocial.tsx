import * as React from 'react'

import { baseUrl } from '@utils'

interface OwnProps {
    platform: string
    displayName: string
}

type Props = OwnProps

class ConnectSocial extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleReceiveMessage = this.handleReceiveMessage.bind(this)
        this.handleConnectClick = this.handleConnectClick.bind(this)
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

        console.log(e.origin, e.source, e.data)
    } 

    handleConnectClick() {
        const { platform } = this.props
        const url = `${baseUrl()}/api/social/${platform}/auth`
        window.open(url, '_blank', 'toolbar=0,location=0,menubar=0,width=700,height=600')
    }

    render() {
        const { platform, displayName } = this.props
        return (
            <div className="edit_form-item edit_form-item-social">
                <label><div className={`edit_form_social_icon edit_form_social_icon-${platform}`} /></label>
                <div className="edit_form_social_text" onClick={this.handleConnectClick}>Connect {displayName} Account</div>
            </div>
        )
    }
}

export default ConnectSocial