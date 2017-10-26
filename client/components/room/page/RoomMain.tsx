import * as React from 'react'
import { connect } from 'react-redux'

import App from '@models/state/app'
import RoomPage from '@models/state/pages/room'
import { goBackward, goForward } from '@actions/room'
import { selectDetailSection } from '@actions/pages/room'

import RoomPlayer from '../player/RoomPlayer.react'
import Counter from '../counter/Counter.react'
import ActivityCounter from '../counter/ActivityCounter.react'
import SmallChat from './chat/SmallChat.react'
import Info from './main/Info'
import More from './main/More'
import Spinner from '@components/shared/Spinner'
import PageError from '@components/shared/PageError'
import AppBanner from '@components/shared/AppBanner'

import { State, DispatchProps } from '@types'

class RoomMain extends React.Component {

    constructor(props) {
        super(props);
        
        this.handleChat = this.handleChat.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        $(document).on('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        $(document).off('keydown', this.handleKeyDown);
    }

    handleKeyDown(e) {
        const { roomPage, dispatch } = this.props 
        const room = roomPage.room()

        if (['textarea', 'input'].indexOf(e.target.tagName.toLowerCase()) !== -1) {
            // don't navigate if inside text field
            return;
        }

        if (e.keyCode === 37) { // left arrow
            if (room.indexOfSelectedMediaItem() !== 0) {
                $('.player_nav-backward').removeClass('player_nav-button-flash');
                process.nextTick(() => {
                    $('.player_nav-backward').addClass('player_nav-button-flash');
                })
            }
            dispatch(goBackward(room.get('id')));  
        } else if (e.keyCode === 39) { // right arrow
            if (room.indexOfSelectedMediaItem() !== room.mediaItemsSize()-1) {
                $('.player_nav-forward').removeClass('player_nav-button-flash');
                process.nextTick(() => {
                    $('.player_nav-forward').addClass('player_nav-button-flash');
                })
            }
            dispatch(goForward(room.get('id')));
        }

    }

    handleChat() {
        this.props.dispatch(selectDetailSection('chat'));
    }

    render() {
        const { roomPage, app } = this.props;

        // display welcome banner here on small screen resolutions 
        // so that it scrolls with rest of content
        const shouldDisplayBanner = app.get('width') === 'small' && roomPage.author().get('username') === 'safiya'
        const shouldDisplaySmallChat = ['small', 'medium'].indexOf(app.get('width')) !== -1

        return (
            <section className="player-container">
                <section className="player content" id="player">
                    <AppBanner url={`nextbeat://rooms/${roomPage.get('hid')}`} />
                    {/* we only display once the room has loaded */}
                    { roomPage.isFetchingDeep() &&  <Spinner type="large grey player" />}
                    { roomPage.get('error') && <PageError>The room could not be found, or it has been deleted by its owner.</PageError>}
                    { !roomPage.isFetchingDeep() && !roomPage.get('error') &&
                    <div className="player_inner">
                        <Counter room={roomPage.room()} />
                        <RoomPlayer room={roomPage.room()} />
                        { shouldDisplaySmallChat && <SmallChat /> }
                        <Info roomPage={roomPage} app={app} />
                        <More roomPage={roomPage} />
                    </div>
                    }
                </section>
            </section>
        );
    }
}

function mapStateToProps(state: State) {
    return {
        roomPage: new RoomPage(state),
        app: new App(state)
    }
}

export default connect(mapStateToProps)(RoomMain);