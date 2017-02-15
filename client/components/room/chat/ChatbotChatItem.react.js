import React from 'react'
import clone from 'lodash/clone'

import renderWithMentions from './utils/renderWithMentions'

if (typeof window !== 'undefined') {
    var robot = require('../../../public/images/robot_64px.png');
}

class ChatbotChatItem extends React.Component {

    constructor(props) {
        super(props);
        
        this.renderMessage = this.renderMessage.bind(this)
    }

    renderMessage() {
        const { comment, forceMentions, handleSelectUsername } = this.props

        var re = /\[(.+)\]\((.+)\)/g 

        let elems = []
        let key = 0
        let lastIndex = 0
        let result

        while (result = re.exec(comment.get('message'))) {
            elems.push(<span key={key}>{renderWithMentions(comment, { start: lastIndex, end: result.index, onClick: handleSelectUsername, forceMentions })}</span>)

            let displayText = result[1]
            let url = result[2]
            elems.push(<a target="_blank" rel="nofollow" href={url} key={key+1}>{displayText}</a>)

            key += 2
            lastIndex = re.lastIndex
        }

        elems.push(<span key={key}>{renderWithMentions(comment, { start: lastIndex, onClick: handleSelectUsername, forceMentions })}</span>)

        return elems
    }

    render() {
        const { comment } = this.props

        let isPrivate = comment.get('subtype') === 'private'
        let privateClass = isPrivate ? 'chat_item-chatbot_body-private' : ''

        return (
            <li className="chat_item chat_item-chatbot">
                <div className="chat_item-chatbot_header">
                    <img className="chat_item_emoji" src={robot} />
                    <span className="chat_item-chatbot_username">nextbot</span>
                    { isPrivate && <span className="chat_item-chatbot_private">only visible to you</span> }
                </div>
                <div className={`chat_item-chatbot_body ${privateClass}`}>
                    {this.renderMessage()}
                </div>
            </li>
        );
    }
}

ChatbotChatItem.defaultProps = {
    forceMentions: false
}

export default ChatbotChatItem;
