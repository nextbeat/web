import * as React from 'react';

class HomeSplash extends React.Component {

    render() {
        return (
            <div className="home_splash">
                <div className="home_splash_top">
                    <span className="home_splash_top-title">Open a door to your world</span>
                </div>
                <div className="home_splash_bottom">
                    <div className="home_splash_box">
                        <div className="home_splash_box-text">
                            <span className="home_splash_box-title">Bring your audience with you</span>
                            <span className="home_splash_box-description">On adventures, behind the scenes, or just to hang out</span>
                        </div>
                    </div>
                    <div className="home_splash_box">
                        <div className="home_splash_box-text">
                            <span className="home_splash_box-title">Go where they go</span>
                            <span className="home_splash_box-description">Be a part of the story</span>
                        </div>
                    </div>
                    <div className="home_splash_box">
                        <div className="home_splash_box-text">
                            <span className="home_splash_box-title">Get updates as they roll in</span>
                            <span className="home_splash_box-description">Be there while it happens</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default HomeSplash;
