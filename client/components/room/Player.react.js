import React from 'react'

import MediaPlayer from './player/MediaPlayer.react'
import Info from './player/Info.react'
import More from './player/More.react'
import Spinner from '../shared/Spinner.react'
import PageError from '../shared/PageError.react'
import AppBanner from '../shared/AppBanner.react'
import WelcomeBanner from '../shared/WelcomeBanner.react'

class Player extends React.Component {

    render() {
        const { stack, app } = this.props;

        // display welcome banner here on small screen resolutions 
        // so that it scrolls with rest of content
        const shouldDisplayBanner = app.get('width') === 'small' && (stack.author().get('username') === 'safiya' || app.get('environment') === 'development')

        return (
            <section className="player-container">
                <section className="player content" id="player">
                    { shouldDisplayBanner && 
                        <WelcomeBanner key="banner">
                            Welcome to Safiya's room! Chat and follow along in real time. <a target="_black" rel="nofollow" href="https://medium.com/@TeamNextbeat/welcome-to-nextbeat-831d25524a4d">Learn more about Nextbeat.</a>
                        </WelcomeBanner>
                    }
                    <AppBanner url={`nextbeat://rooms/${stack.get('hid')}`} />
                    {/* we only display once the stack has loaded */}
                    { stack.isFetchingDeep() &&  <Spinner type="large grey player" />}
                    { stack.get('error') && <PageError>The room could not be found, or it has been deleted by its owner.</PageError>}
                    { !stack.isFetchingDeep() && !stack.get('error') &&
                    <div>
                        <MediaPlayer {...this.props} />
                        <Info {...this.props} />
                        <More stack={stack} />
                    </div>
                    }
                </section>
            </section>
        );
    }
}

export default Player;