import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { List } from 'immutable'

import Dropdown from '@components/shared/Dropdown'

import RoomPage from '@models/state/pages/room'
import CurrentUser from '@models/state/currentUser'
import Emoji from '@models/objects/emoji'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    emojis: List<Emoji>
    canUseEmoji: boolean
}

type Props = ConnectProps & DispatchProps

class ChatEmojiDropdown extends React.Component<Props> {

    render() {
        const { emojis, canUseEmoji } = this.props
        const disabledEmojiClass = canUseEmoji ? '' : 'chat_compose_emoji_list-disabled'

        return (
            <Dropdown type="chat-emoji" style="info" triangleMargin={{ left: '10px' }} triangleOnBottom={true}>
                <div className={`chat_compose_emoji_list ${disabledEmojiClass}`}>
                    {emojis.map(emoji => 
                        <div key={emoji.get('name')} className="chat_compose_emoji_element" data-name={emoji.get('name')}>
                            <img src={emoji.url()} alt={emoji.get('name')} />
                        </div>
                    )}
                </div>
            </Dropdown>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    const isSubscribed = CurrentUser.isSubscribed(state, RoomPage.entity(state).author().get('id'))
    const isCurrentUserAuthor = RoomPage.isCurrentUserAuthor(state)

    return {
        emojis: RoomPage.authorEmojis(state),
        canUseEmoji: isSubscribed || isCurrentUserAuthor
    }
}

export default connect(mapStateToProps)(ChatEmojiDropdown)