import React from 'react';

class WelcomeBanner extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'WelcomeBanner';
    }
    render() {
        return (
            <div className="app-banner welcome-banner">
                <div className="app-banner_prompt" onClick={this.handleClick} >
                    <div>Open in app</div>
                </div>
                <div className="app-banner_close" onClick={this.handleClose} >
                    <Icon type="close" />
                </div>
            </div>
        );
    }
}

export default WelcomeBanner;
