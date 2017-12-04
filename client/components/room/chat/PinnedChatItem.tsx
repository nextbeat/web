import * as React from 'react'
import { connect } from 'react-redux'

import renderMessageText from './utils/renderMessageText'
import { unpinComment } from '@actions/room'
import { searchChat } from '@actions/pages/room'
import RoomPage from '@models/state/pages/room'
import Room from '@models/state/room'
import Comment from '@models/entities/comment'
import { State, DispatchProps } from '@types'

interface Props {
    pinnedComment: Comment | null
    
    roomId: number
    isCreator: boolean
    isCurrentUserAuthor: boolean
}

class PinnedChatItem extends React.Component<Props & DispatchProps> {

    constructor(props: Props & DispatchProps) {
        super(props);

        this.handleUnpin = this.handleUnpin.bind(this)
        this.handleSelectHashtag = this.handleSelectHashtag.bind(this)
    }

    handleUnpin() {
        const { dispatch, roomId } = this.props
        dispatch(unpinComment(roomId))
    }

    handleSelectHashtag(tag: string) {
        this.props.dispatch(searchChat(tag))
    }

    render() {
        const { pinnedComment, isCreator, isCurrentUserAuthor } = this.props 
        const creatorClass = isCreator ? 'creator' : ''

        if (!pinnedComment) {
            return null;
        }

        return (
            <div className="chat_pinned-comment">
                <div className="chat_item-pinned-comment chat_item">
                    <div className="chat_item-pinned-comment_header">
                        <span className={`chat_item_username chat_item-pinned-comment_username ${creatorClass}`}>{pinnedComment.author().get('username')}</span>
                    </div>
                    <div className="chat_item-pinned-comment_body">
                       { renderMessageText(pinnedComment, { onHashtagClick: this.handleSelectHashtag }) }
                    </div>
                </div>
                { isCurrentUserAuthor &&
                    <div className="btn btn-gray chat_pinned-comment_unpin" onClick={this.handleUnpin}>Remove</div>
                }
                { !isCurrentUserAuthor && 
                    <div className="chat_item-pinned-comment_pinned">Pinned</div>
                }
            </div>
        )
    }

}

function mapStateToProps(state: State): Props {
    const pinnedComment = RoomPage.pinnedComment(state)
    return {
        pinnedComment,
        roomId: RoomPage.get(state, 'id'),
        isCreator: !!pinnedComment && RoomPage.author(state).get('username') === pinnedComment.author().get('username'),
        isCurrentUserAuthor: RoomPage.isCurrentUserAuthor(state)
    }
}

export default connect(mapStateToProps)(PinnedChatItem)