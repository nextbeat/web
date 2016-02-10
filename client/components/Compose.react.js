import React from 'react';

class Compose extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { user } = this.props;
        return (
            <div id="compose">
            { user ? <p>Chat!</p> : <p>Login to chat.</p>}
            </div>
        );
    }
}

export default Compose;
