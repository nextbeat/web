import * as React from 'react'
import { connect } from 'react-redux'

import SmallLogo from './SmallLogo'
import Icon from './Icon'

import App from '@models/state/app'
import CurrentUser from '@models/state/currentUser'
import { storageAvailable } from '@utils'
import { gaEvent } from '@actions/ga'
import { State, DispatchProps } from '@types'

const STORE_URL = "https://itunes.apple.com/us/app/nextbeat/id1101932727?mt=8"

interface Props {
    url?: string
    isIOS: boolean
    browser: string
    version: string
}

interface AppBannerState {
    hideBanner: boolean
}

class AppBanner extends React.Component<Props & DispatchProps, AppBannerState> {

    static defaultProps = {
        url: 'nextbeat://'
    }

    constructor(props: Props & DispatchProps) {
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
            // TODO: test app banner is working!
            this.setState({
                hideBanner: JSON.parse(sessionStorage.getItem('hideAppBanner') as string) 
            })
        }
    }

    handleClick(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();

        const { browser, version, url, dispatch } = this.props

        const isMobileSafari = browser === 'Mobile Safari' && parseFloat(version) >= 9
        // If the delay is too short in Mobile Safari, 
        // it automatically redirects you to the app store
        // because the "open in Nextbeat" prompt is non-blocking.
        // Why after a certain threshold it behaves fine I have no idea.
        const delay = isMobileSafari ? 1800 : 500

        function goToApp() {
             (window as any).location = url;
            // Fallback to App Store url if user does not have the app installed
            setTimeout(() => {
                (window.top as any).location = STORE_URL;
            }, delay);
        }

        // Send analytics event first, navigating once request has gone through
        dispatch(gaEvent({
            category: 'app',
            action: 'goToApp',
        }, goToApp))

    }

    handleClose(e: React.MouseEvent<HTMLElement>) {
        this.setState({
            hideBanner: true
        })
        if (storageAvailable('sessionStorage')) {
            sessionStorage.setItem('hideAppBanner', 'true')
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
        const { isIOS } = this.props
        const { hideBanner } = this.state 

        if (!isIOS || hideBanner) {
            return null;
        }
        
        return this.renderOpenInAppBanner()
    }
}

function mapStateToProps(state: State) {
    return {
        isIOS: App.isIOS(state),
        browser: App.get(state, 'browser'),
        version: App.get(state, 'version')
    }
}

export default connect(mapStateToProps)(AppBanner)
