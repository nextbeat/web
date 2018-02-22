import * as React from 'react'
import { connect } from 'react-redux'

import OpenInAppComponent, { OpenProps } from '@components/utils/OpenInAppComponent'
import SmallLogo from './SmallLogo'
import Icon from './Icon'

import App from '@models/state/app'
import { State, DispatchProps } from '@types'
import { storageAvailable } from '@utils'

interface OwnProps {
    url?: string
}

interface ConnectProps {
    isIOS: boolean
}

type Props = OwnProps & ConnectProps & DispatchProps & OpenProps

interface ComponentState {
    hideBanner: boolean
}

class AppBanner extends React.Component<Props, ComponentState> {

    static defaultProps = {
        url: 'nextbeat://'
    }

    constructor(props: Props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
        this.handleClose = this.handleClose.bind(this)
        this.renderOpenInAppBanner = this.renderOpenInAppBanner.bind(this)

        this.state = {
            hideBanner: true
        }
    }

    handleClick(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();

        const { openInApp, url } = this.props

        openInApp(url as string)
    }

    handleClose(e: React.MouseEvent<HTMLElement>) {
        this.setState({
            hideBanner: true
        })
        
        if (storageAvailable('sessionStorage')) {
            sessionStorage.setItem('hideAppBanner', 'true')
        }
    }

    renderOpenInAppBanner() {
        return (
            <a className="app-banner">
                <div className="app-banner_prompt" onClick={this.handleClick} >
                    <div>Open in app</div>
                </div>
                <div className="app-banner_close" onClick={this.handleClose} >
                    <Icon type="close" />
                </div>
            </a>
        )
    }

    render() {
        const { isIOS } = this.props
        const { hideBanner } = this.state 

        if (!isIOS || hideBanner) {
            return null;
        }
        
        return this.renderOpenInAppBanner()
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isIOS: App.isIOS(state),
    }
}

export default connect(mapStateToProps)(OpenInAppComponent(AppBanner))
