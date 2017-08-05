import React from 'react'
import { List } from 'immutable'
import { connect } from 'react-redux'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import debounce from 'lodash/debounce'

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
        const { roomPage, display, hasLostConnection } = this.props;
        const pinnedComment = roomPage.pinnedComment()
        const chatTags = roomPage.get('chatTags') || List()

        return (
        <div className="chat" onWheel={debounce(this.handleOnWheel, 200)} style={{ display: (display ? "flex" : "none") }}>
            <UserActions />
            <WelcomeBanner username={roomPage.author().get('username')} closed={roomPage.get('closed')} />
            { chatTags.size > 0 && 
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
            <ReactCSSTransitionGroup transitionName="chat_lost-connection" transitionEnterTimeout={300} transitionLeaveTimeout={200}>
                { hasLostConnection && 
                    <div key="lost-connection" className="chat_lost-connection">
                        Lost connection. Reconnecting...
                    </div>
                }
            </ReactCSSTransitionGroup>
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
