import React from 'react';

class NoMatch extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
        <div className="no-match content">
            <div className="content_inner">
                <div className="content_header">
                    Page Not Found
                </div>
                <div className="content_main">
                    Something went wrong, and now you're here! We apologize for any undue stress this may have caused.
                </div>
            </div>
        </div>
        );
    }
}

export default NoMatch;
