import React from 'react';

class Compose extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            message: ''
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.chat = this.chat.bind(this);
    }

    handleChange(e) {
        this.setState({ message: e.target.value });
    }

    handleSubmit(e) {
        this.props.sendComment(this.state.message);
        this.setState({ message: '' })
    }

    chat() {
        return (
            <div>
                <textarea onChange={this.handleChange} placeholder="Send a message" value={this.state.message}></textarea>
                <input type="submit" value="Send" disabled={this.state.message == 0} onClick={this.handleSubmit} />
            </div>
        )
    }

    render() {
        const { user, closed } = this.props;
        return (
            <div id="compose">
            { closed ? <p>Room is no longer open.</p> : ( user.has('id') ? this.chat() : <p>Login to chat.</p> ) }
            </div>
        );
    }
}

export default Compose;
