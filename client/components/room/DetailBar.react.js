import React from 'react';

class DetailBar extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'DetailBar';
    }
    render() {
        return (
            <div className="detail-bar">
                <div className="detail-bar_header">
                    <span className="detail-bar_tab">Chat</span>
                    <span className="detail-bar_tab">Activity</span>
                </div>
            </div>
        );
    }
}

export default DetailBar;
