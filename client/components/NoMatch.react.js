import React from 'react';

class NoMatch extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <div className="no-match">404 Error: This page does not exist. :(</div>
    }
}

export default NoMatch;
