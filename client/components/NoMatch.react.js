import React from 'react';

class NoMatch extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
        <div className="no-match">
            <h1>404 Error</h1> 
            <p>This page does not exist. :(</p>
        </div>
        );
    }
}

export default NoMatch;
