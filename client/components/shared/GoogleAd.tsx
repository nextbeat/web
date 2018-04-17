import * as React from 'react'
import { connect } from 'react-redux'

import App from '@models/state/app'
import { State } from '@types'

interface OwnProps {
    slot: string

    format?: string
    style?: any
    className?: string
}

interface ConnectProps {
    environment: string
}

type Props = OwnProps & ConnectProps

interface ErrorComponentState {
    error?: Error
}

class GoogleAd extends React.Component<Props> {

    componentDidMount() {
        if (typeof window !== 'undefined') {
            // @ts-ignore: Ignore globals
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    }

    render() {
        const { slot, format, className, environment, style } = this.props

        const dataAttrs: any = {
            "data-ad-client": "ca-pub-6179673641751101",
            "data-ad-slot": slot
        }

        if (environment !== 'production') {
            dataAttrs["data-adtest"] = "on"
        }
        if (format) {
            dataAttrs["data-ad-format"] = format
        }

        return (
            <ins 
                className={`adsbygoogle ${className || ''}`}
                style={style || {}}
                {...dataAttrs}
            />
        )
    }
}


class GoogleAdErrorBoundary extends React.Component<Props, ErrorComponentState> {

    constructor(props: Props) {
        super(props)

        this.state = {}
    }

    componentDidCatch(error: Error, info: any) {
        this.setState({ error })
    }

    render() {
        if (this.state.error) {
            return null;
        }

        return <GoogleAd {...this.props} />
    }
}


function mapStateToProps(state: State): ConnectProps {
    return {
        environment: App.get(state, 'environment')
    }
}

export default connect(mapStateToProps)(GoogleAdErrorBoundary);