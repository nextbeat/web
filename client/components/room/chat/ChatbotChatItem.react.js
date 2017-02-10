import React from 'react';

if (typeof window !== 'undefined') {
    var robot = require('../../../public/images/robot_64px.png');
}

class ChatbotChatItem extends React.Component {

    renderMessage(message) {
        // (Very) rudimentary implementation of a Markdown parser with support only for links.
        var re = /\[(.+)\]\((.+)\)/g 

        let elems = []
        let result
        let key = 0
        let lastIndex = 0
        while (result = re.exec(message)) {
            elems.push(<span key={key}>{message.slice(lastIndex, result.index)}</span>)

            let displayText = result[1]
            let url = result[2]
            elems.push(<a target="_blank" rel="nofollow" href={url} key={key+1}>{displayText}</a>)

            key += 2
            lastIndex = re.lastIndex
        }
        elems.push(<span key={key}>{message.slice(lastIndex)}</span>)

        return elems
    }

    render() {
        const { message } = this.props
        return (
            <li className="chat_item chat_item-chatbot">
                <div className="chat_item-chatbot_header">
                    <img className="chat_item_emoji" src={robot} />
                    <span className="chat_item-chatbot_username">nextbot</span>
                    <span className="chat_item-chatbot_private">only visible to you</span>
                </div>
                {this.renderMessage(message)}
            </li>
        );
    }
}

export default ChatbotChatItem;
