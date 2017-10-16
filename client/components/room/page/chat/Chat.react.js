import React from 'react'
import { List } from 'immutable'
import debounce from 'lodash/debounce'
import { connect } from 'react-redux'
import TransitionGroup from 'react-transition-group/TransitionGroup'
import CSSTransition from 'react-transition-group/CSSTransition'

import Compose from './Compose.react'
import ChatHeader from './ChatHeader.react'
import ChatSearchResults from './ChatSearchResults.react'
import UserActions from './UserActions.react'
import WelcomeBanner from './WelcomeBanner.react'
import ScrollableChatHistory from '../../chat/ScrollableChatHistory.react'
import Spinner from '../../../shared/Spinner.react'
import PinnedChatItem from '../../chat/PinnedChatItem.react'

import { loadComments, sendComment, promptChatActionsForUser, resetChat, didUseChat } from '../../../../actions'
import { RoomPage, CurrentUser, App, Eddy } from '../../../../models'

class Chat extends React.Component {

    constructor(props) {
        super(props);

        this.handleOnWheel = this.handleOnWheel.bind(this);
    }

    componentDidMount() {
        $(window).on('focus.chat', () => {
            const { dispatch, app } = this.props
            if (app.get('activeOverlay') === 'chat' && app.get('deviceType') === 'mobile') {
                dispatch(resetChat())
            }
        })
    }

    componentWillUnmount() {
        $(window).off('focus.chat')
    }


    // Events

    handleOnWheel() {
        this.props.dispatch(didUseChat())
    }

    render() {
        const { roomPage, display, hasLostConnection, app } = this.props;
        const pinnedComment = roomPage.pinnedComment()
        const chatTags = roomPage.get('chatTags') || List()
        const isOverlayActive = app.get('activeOverlay') === 'chat'

        return (
        <div className="chat" onWheel={debounce(this.handleOnWheel, 200)} style={{ display: (display ? "flex" : "none") }}>
            <UserActions />
            <WelcomeBanner username={roomPage.author().get('username')} closed={roomPage.get('closed')} />
            { (chatTags.size > 0 || isOverlayActive) && 
                <ChatHeader tags={chatTags} />
            }
            { pinnedComment && 
                <PinnedChatItem pinnedComment={pinnedComment} />
            }
            { roomPage.get('showSearchResults') && 
                <ChatSearchResults />
            } 
            <ScrollableChatHistory roomId={roomPage.room().id} />
            <Compose />
            <TransitionGroup>
                { hasLostConnection && 
                    <CSSTransition classNames="chat_lost-connection" timeout={{ enter: 300, exit: 200 }}>
                        <div key="lost-connection" className="chat_lost-connection">
                            Lost connection. Reconnecting...
                        </div>
                    </CSSTransition>
                }
            </TransitionGroup>
        </div>
        );
    }
}

function mapStateToProps(state) {
    let eddy = new Eddy(state)
    return {
        roomPage: new RoomPage(state),
        app: new App(state),
        hasLostConnection: eddy.get('hasLostConnection')
    }
}

export default connect(mapStateToProps)(Chat);
