import * as React from 'react'
import { connect } from 'react-redux'
import hoistStatics from 'hoist-non-react-statics'
import omit from 'lodash-es/omit'

import { gaEvent } from '@actions/ga'
import App from '@models/state/app'
import { State, DispatchProps } from '@types'

export interface OpenProps {
    openInApp: (url: string) => void
}

interface ConnectProps {
    browser: string
    version: string,
    isIOS: boolean
}

const STORE_URL = "https://itunes.apple.com/us/app/nextbeat/id1101932727?mt=8"


export default function OpenInAppComponent<OriginalProps>(ChildComponent: React.ComponentClass<OriginalProps & OpenProps>) {

    class OpenInAppContainer extends React.Component<OriginalProps & DispatchProps & ConnectProps> {

        constructor(props: any) {
            super(props)

            this.openInApp = this.openInApp.bind(this)
        }

        openInApp(url: string) {
            const { browser, version, dispatch } = this.props

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
                }, delay*0);
            }

            // Send analytics event first, navigating once request has gone through
            dispatch(gaEvent({
                category: 'app',
                action: 'goToApp',
            }, goToApp))
        }

        render() {
            const openProps = {
                openInApp: this.openInApp
            }

            return <ChildComponent {...this.props as any} {...openProps as any}  />
        }
    }

    // Note: necessary to define ownProps parameter here, as the Typescript
    // definition for connect() will remove OriginalProps from the prop
    // requirements otherwise.
    function mapStateToProps(state: State, ownProps: OriginalProps): ConnectProps {
        return {
            isIOS: App.isIOS(state),
            browser: App.get(state, 'browser'),
            version: App.get(state, 'version')
        }
    }

    return connect(mapStateToProps)(hoistStatics(OpenInAppContainer, ChildComponent))
}