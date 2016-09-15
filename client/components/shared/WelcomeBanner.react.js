import React from 'react';

class WelcomeBanner extends React.Component {

    render() {
        return (
            <div className="app-banner welcome-banner">
                <div className="app-banner_prompt" onClick={this.handleClick} >
                    { this.props.children }
                </div>
                <div className="app-banner_close" onClick={this.handleClose} >
                    <Icon type="close" />
                </div>
            </div>
        );
    }
}

export default WelcomeBanner;
