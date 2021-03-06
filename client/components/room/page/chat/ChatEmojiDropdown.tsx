import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { List } from 'immutable'
import * as TransitionGroup from 'react-transition-group/TransitionGroup'
import * as CSSTransition from 'react-transition-group/CSSTransition'

import Dropdown from '@components/shared/Dropdown'
import Subscribe from '@components/shared/Subscribe'

import { closeDropdown } from '@actions/app'
import { insertEmoji } from '@actions/pages/room'
import RoomPage from '@models/state/pages/room'
import CurrentUser from '@models/state/currentUser'
import User from '@models/entities/user'
import Emoji from '@models/objects/emoji'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    emojis: List<Emoji>
    canUseEmoji: boolean
    author: User
}

type Props = ConnectProps & DispatchProps

class ChatEmojiDropdown extends React.Component<Props> {

    onClick(emoji: Emoji) {
        const { dispatch, canUseEmoji } = this.props
        if (!canUseEmoji) {
            return
        }

        dispatch(insertEmoji(emoji.get('name')))
        dispatch(closeDropdown('chat-emoji'))
    }

    render() {
        const { emojis, canUseEmoji, author } = this.props
        const disabledEmojiClass = canUseEmoji ? '' : 'chat_compose_emoji_list-disabled'

        return (
            <Dropdown type="chat-emoji" style="info" triangleMargin={{ left: '10px' }} triangleOnBottom={true} shouldCloseOnClick={false}>
                <div className={`chat_compose_emoji_list ${disabledEmojiClass}`}>
                    {emojis.map(emoji => 
                        <div key={emoji.get('name')} className="chat_compose_emoji_element" data-name={emoji.get('name')} onClick={this.onClick.bind(this, emoji)}>
                            <img src={emoji.url()} alt={emoji.get('name')} />
                        </div>
                    )}
                </div>
                <TransitionGroup>
                    { !canUseEmoji && 
                        <CSSTransition classNames="chat_compose_emoji_subscribe" timeout={150}>
                            <div className="chat_compose_emoji_subscribe">
                                <div className="chat_compose_emoji_subscribe_text">Subscribe to {author.get('username')} to unlock custom emoji!</div>
                                <Subscribe user={author} />
                            </div>
                        </CSSTransition>
                    }
                </TransitionGroup>
            </Dropdown>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    const isSubscribed = CurrentUser.isSubscribed(state, RoomPage.entity(state).author().get('id'))
    const isCurrentUserAuthor = RoomPage.isCurrentUserAuthor(state)

    return {
        emojis: RoomPage.authorEmojis(state),
        canUseEmoji: isSubscribed || isCurrentUserAuthor,
        author: RoomPage.author(state),
    }
}

export default connect(mapStateToProps)(ChatEmojiDropdown)