import React from 'react'
import { connect } from 'react-redux'

import renderMessageText from './utils/renderMessageText'
import Icon from '../../shared/Icon.react'
import { RoomPage } from '../../../models'
import { unpinComment } from '../../../actions'

class PinnedChatItem extends React.Component {

    constructor(props) {
        super(props);

        this.handleUnpin = this.handleUnpin.bind(this)
    }

    handleUnpin() {
        const { dispatch, roomId } = this.props
        dispatch(unpinComment(roomId))
    }

    render() {
        const { pinnedComment, isCreator, currentUserIsAuthor } = this.props 
        const creatorClass = isCreator ? 'chat_item_creator' : ''

        return (
            <div className="chat_pinned-comment">
                { currentUserIsAuthor && 
                    <div className="btn btn-gray chat_pinned-comment_unpin" onClick={this.handleUnpin}>Remove</div>
                }
                <div className="chat_item-pinned-comment chat_item">
                    <div className="chat_item-pinned-comment_header">
                        <span className={`chat_item_username chat_item-pinned-comment_username ${creatorClass}`}>{pinnedComment.author().get('username')}</span>
                        <Icon type="pin" /><span className="chat_item-pinned-comment_pinned">Pinned</span>
                    </div>
                    <div className="chat_item-pinned-comment_body">
                       { renderMessageText(pinnedComment) }
                    </div>
                </div>
            </div>
        )
    }

}

function mapStateToProps(state, ownProps) {
    let roomPage = new RoomPage(state)
    return {
        roomId: roomPage.get('id'),
        isCreator: roomPage.author().get('username') === ownProps.pinnedComment.author().get('username'),
        currentUserIsAuthor: roomPage.currentUserIsAuthor()
    }
}

export default connect(mapStateToProps)(PinnedChatItem)