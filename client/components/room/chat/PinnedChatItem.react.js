import React from 'react'
import { connect } from 'react-redux'

import renderMessageText from './utils/renderMessageText'
import Icon from '../../shared/Icon.react'
import { RoomPage } from '../../../models'

class PinnedChatItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { pinnedComment, isCreator } = this.props 
        const creatorClass = isCreator ? 'chat_item_creator' : ''

        return (
            <div className="chat_pinned-comment">
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
        isCreator: roomPage.author().get('username') === ownProps.pinnedComment.author().get('username')
    }
}

export default connect(mapStateToProps)(PinnedChatItem)