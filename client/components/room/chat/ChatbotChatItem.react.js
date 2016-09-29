import React from 'react';

class ChatbotChatItem extends React.Component {

    render() {
        const { message } = this.props
        return (
            <li className="chat_item chat_item-chatbot">
                {message}
            </li>
        );
    }
}

export default ChatbotChatItem;
