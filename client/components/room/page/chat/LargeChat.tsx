import * as React from 'react'
import { List } from 'immutable'
import debounce from 'lodash-es/debounce'
import { connect } from 'react-redux'
import * as TransitionGroup from 'react-transition-group/TransitionGroup'
import * as CSSTransition from 'react-transition-group/CSSTransition'

import Compose from './Compose'
import ChatSearchResults from './ChatSearchResults'
import UserActions from './UserActions'
import ScrollableChatHistory from '@components/room/chat/ScrollableChatHistory'
import Spinner from '@components/shared/Spinner'
import PinnedChatItem from '@components/room/chat/PinnedChatItem'

import { promptChatActionsForUser, resetChat } from '@actions/pages/room'
import { loadComments, sendComment, didUseChat } from '@actions/room'
import RoomPage from '@models/state/pages/room'
import Room from '@models/state/room'
import App from '@models/state/app'
import Eddy from '@models/state/eddy'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    hasLostConnection: boolean
    roomId: number
    isClosed: boolean
    authorUsername: string
    hasPinnedComment: boolean
    showSearchResults: boolean
}

type Props =  ConnectProps & DispatchProps

class LargeChat extends React.Component<Props> {

    render() {
        const { hasLostConnection, hasPinnedComment, 
                showSearchResults, isClosed, authorUsername, roomId } = this.props;

        return (
        <div className="chat_large">
            <UserActions />
            { hasPinnedComment && 
                <PinnedChatItem />
            }
            { showSearchResults && 
                <ChatSearchResults />
            } 
            <ScrollableChatHistory roomId={roomId} style="expanded" />
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

function mapStateToProps(state: State): ConnectProps {
    return {
        hasLostConnection: Eddy.get(state, 'hasLostConnection'),
        roomId: RoomPage.get(state, 'id'),
        isClosed: RoomPage.status(state) === 'closed',
        authorUsername: RoomPage.entity(state).author().get('username'),
        hasPinnedComment: !!RoomPage.pinnedComment(state),
        showSearchResults: RoomPage.get(state, 'showSearchResults'),
    }
}

export default connect(mapStateToProps)(LargeChat);
