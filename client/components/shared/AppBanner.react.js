import React from 'react'
import { connect } from 'react-redux'

import { App, CurrentUser } from '../../models'
import { storageAvailable } from '../../utils'
import { gaEvent } from '../../actions'
import SmallLogo from './SmallLogo.react'
import Icon from './Icon.react'

const STORE_URL = "https://itunes.apple.com/us/app/nextbeat/id1101932727?mt=8"

class AppBanner extends React.Component {

    constructor(props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
        this.handleClose = this.handleClose.bind(this)
        this.renderGetAppBanner = this.renderGetAppBanner.bind(this)
        this.renderOpenInAppBanner = this.renderOpenInAppBanner.bind(this)

        this.state = {
            hideBanner: true
        }
    }

    componentDidMount() {
        if (typeof window === 'undefined') {
            // default to showing banner on client
            this.setState({
                hideBanner: false
            })
        }

        if (storageAvailable('sessionStorage')) {
            this.setState({
                hideBanner: JSON.parse(sessionStorage.getItem('hideAppBanner')) 
            })
        }
    }

    handleClick(e) {
        e.preventDefault();

        const { app, user, url, dispatch } = this.props

        const isMobileSafari = app.get('browser') === 'Mobile Safari' && parseFloat(app.get('version', 0)) >= 9
        // If the delay is too short in Mobile Safari, 
        // it automatically redirects you to the app store
        // because the "open in Nextbeat" prompt is non-blocking.
        // Why after a certain threshold it behaves fine I have no idea.
        const delay = isMobileSafari ? 1800 : 500

        function goToApp() {
             window.location = url;
            // Fallback to App Store url if user does not have the app installed
            setTimeout(() => {
                window.top.location = STORE_URL;
            }, delay);
        }

        // Send analytics event first, navigating once request has gone through
        dispatch(gaEvent({
            category: 'app',
            action: 'goToApp',
        }, goToApp))

    }

    handleClose(e) {
        this.setState({
            hideBanner: true
        })
        if (storageAvailable('sessionStorage')) {
            sessionStorage.setItem('hideAppBanner', true)
        }
    }

    renderGetAppBanner() {
        return (
            <a className="app-banner" href={STORE_URL}>
                <SmallLogo />
                <div className="app-banner_main">
                    <div className="app-banner_name">Nextbeat</div>
                    <div className="app-banner_description">Get it for free on the App Store.</div>
                </div>
                <div className="app-banner_button">
                    <div className="app-banner_button-inner">GET</div>
                </div>
            </a>
        )
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
        const { app, user } = this.props
        const { hideBanner } = this.state 

        if (!app.isIOS() || hideBanner) {
            return null;
        }
        
        return this.renderOpenInAppBanner()
    }
}

AppBanner.defaultProps = {
    url: 'nextbeat://'
}

function mapStateToProps(state) {
    return {
        app: new App(state),
        user: new CurrentUser(state)
    }
}

export default connect(mapStateToProps)(AppBanner)
