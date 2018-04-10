import * as React from 'react'

interface Props {
    username: string

    className?: string
}

// todo: need to remove iframe on willUnmount

class TwitterTimeline extends React.Component<Props> {

    private twitterRef: HTMLElement

    componentDidMount() {
        const { username } = this.props
        var $script = require('scriptjs') as any
        $script.ready('twitter-widgets', () => {
            (window as any).twttr.widgets.createTimeline(
                {
                    sourceType: 'profile',
                    screenName: username
                },
                this.twitterRef,
                {
                    chrome: 'noheader,nofooter,noborders',
                    height: 400
                }
            )
        })
    }

    render() {
        const className = this.props.className || ''
        return (
            <div className={`twitter_container ${className}`}>
                <div ref={(c) => { if (c) this.twitterRef = c }} />
            </div>
        )
    }
}

export default TwitterTimeline;