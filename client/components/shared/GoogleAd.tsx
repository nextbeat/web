import * as React from 'react'

interface Props {
    slot: string
    format: string

    className?: string
}

interface ErrorComponentState {
    error?: Error
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

class GoogleAd extends React.Component<Props> {

    componentDidMount() {
        if (typeof window !== 'undefined') {
            // @ts-ignore: Ignore globals
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    }

    render() {
        const { slot, format, className } = this.props
        return (
            <ins 
                className={`adsbygoogle ${className || ''}`}
                data-ad-client="ca-pub-6179673641751101"
                data-ad-slot={slot}
                data-ad-format={format}
            />
        )
    }
}

export default GoogleAdErrorBoundary;