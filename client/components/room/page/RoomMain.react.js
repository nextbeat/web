import React from 'react'
import { connect } from 'react-redux'

import { RoomPage, App } from '../../../models'
import { selectDetailSection } from '../../../actions'

import RoomPlayer from '../player/RoomPlayer.react'
import Counter from '../counter/Counter.react'
import ActivityCounter from '../counter/ActivityCounter.react'
import Info from './main/Info.react'
import More from './main/More.react'
import Spinner from '../../shared/Spinner.react'
import PageError from '../../shared/PageError.react'
import AppBanner from '../../shared/AppBanner.react'
import WelcomeBanner from '../../shared/WelcomeBanner.react'

class RoomMain extends React.Component {

    constructor(props) {
        super(props);
        
        this.handleChat = this.handleChat.bind(this);
    }

    handleChat() {
        this.props.dispatch(selectDetailSection('chat'));
    }

    render() {
        const { roomPage, app } = this.props;

        // display welcome banner here on small screen resolutions 
        // so that it scrolls with rest of content
        const shouldDisplayBanner = app.get('width') === 'small' && (roomPage.author().get('username') === 'safiya' || app.get('environment') === 'development')

        // display detail buttons if screen at appropriate width
        const detailButtonsActive = app.get('width') === 'small' || app.get('width') === 'medium'

        return (
            <section className="player-container">
                <section className="player content" id="player">
                    { shouldDisplayBanner && 
                        <WelcomeBanner key="banner">
                            Welcome to Safiya's room! Chat and follow along in real time. <a target="_black" rel="nofollow" href="https://medium.com/@TeamNextbeat/welcome-to-nextbeat-831d25524a4d">Learn more about Nextbeat.</a>
                        </WelcomeBanner>
                    }
                    <AppBanner url={`nextbeat://rooms/${roomPage.get('hid')}`} />
                    {/* we only display once the room  has loaded */}
                    { roomPage.isFetchingDeep() &&  <Spinner type="large grey player" />}
                    { roomPage.get('error') && <PageError>The room could not be found, or it has been deleted by its owner.</PageError>}
                    { !roomPage.isFetchingDeep() && !roomPage.get('error') &&
                    <div className="player_inner">
                        { detailButtonsActive && <div className="player_hover-button player_chat-button" onClick={this.handleChat}>Chat</div>}
                        { detailButtonsActive ? <ActivityCounter room={roomPage.room()} /> : <Counter room={roomPage.room()} /> }
                        <RoomPlayer room={roomPage.room()}/>
                        <Info roomPage={roomPage} />
                        <More roomPage={roomPage} />
                    </div>
                    }
                </section>
            </section>
        );
    }
}

function mapStateToProps(state) {
    return {
        roomPage: new RoomPage(state),
        app: new App(state)
    }
}

export default connect(mapStateToProps)(RoomMain);