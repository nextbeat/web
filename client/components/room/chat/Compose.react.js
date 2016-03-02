import React from 'react'
import { cloneDeep } from 'lodash'

class Compose extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            message: ''
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.renderChat = this.renderChat.bind(this);
    }

    handleChange(e) {
        this.setState({ message: e.target.value });
    }

    handleSubmit(e) {
        this.props.sendComment(this.state.message);
        this.setState({ message: '' })
    }

    handleKeyPress(e) {
        if (e.charCode === 13) { // Enter
            e.preventDefault();
            this.handleSubmit();
        }
    }

    renderChat() {
        return (
            <div className="chat_compose-inner">
                <textarea onChange={this.handleChange} onKeyPress={this.handleKeyPress} placeholder="Send a message" value={this.state.message}></textarea>
                <input type="submit" className="btn" value="Send" disabled={this.state.message == 0} onClick={this.handleSubmit} />
            </div>
        )
    }

    render() {
        const { user, closed } = this.props;
        return (
            <div className="chat_compose">
            { closed ? <p>Room is no longer open.</p> : ( user.isLoggedIn() ? this.renderChat() : <p>Login to chat.</p> ) }
            </div>
        );
    }
}

export default Compose;
