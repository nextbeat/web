import * as React from 'react'
import { Link } from 'react-router'

class About extends React.Component {
    render() {
        return (
            <div className="about">
                <div className="about_header">
                    <div className="about_header_triangle" />
                    <h1>What is Nextbeat?</h1>
                    <p>Nextbeat lets you hang out with your favorite Youtubers and streamers in real time. Each Nextbeat room is a shared space where creators can interact with their community — you can ask questions and make requests in the chat (which creators can answer with punchy video replies), or just hang out with superfans like you!</p>
                </div>
                <div className="about_why">
                    <div className="about_why_header">
                        <h1>Why Nextbeat?</h1>
                    </div>
                    <div className="about_features">
                        <div className="about_feature about_feature-content">
                            <div className="about_feature_icon_container">
                                <div className="about_feature_icon" />
                            </div>
                            <div className="about_feature_title">Candid content.</div>
                            <div className="about_feature_text">Nextbeat lets you ride shotgun alongside your favorite content creators in real-time.</div>
                        </div>
                        <div className="about_feature about_feature-friends">
                            <div className="about_feature_icon_container">
                                <div className="about_feature_icon" />
                            </div>
                            <div className="about_feature_title">Find friends.</div>
                            <div className="about_feature_text">In between video drops, you can ask questions, make requests, and mingle with a community of superfans like you.</div>
                        </div>
                        <div className="about_feature about_feature-highlights">
                            <div className="about_feature_icon_container">
                                <div className="about_feature_icon" />
                            </div>
                            <div className="about_feature_title">Just the highlights.</div>
                            <div className="about_feature_text">Experience the intimacy and easy, unfiltered attitude of a livestream, without all the dead air.</div>
                        </div>
                        <div className="about_feature about_feature-moment">
                            <div className="about_feature_icon_container">
                                <div className="about_feature_icon" />
                            </div>
                            <div className="about_feature_title">Stay in the moment.</div>
                            <div className="about_feature_text">Even if you join in late, the easily navigable Activity feed makes catching up a snap, so you never have to worry about getting left behind. </div>
                        </div>
                    </div>
                </div>
                <div className="about_get-started">
                    <div className="about_get-started_header">
                        <h2>Ready to get started?</h2>
                    </div>
                    <Link to="/" className="about_get-started_button company_button">Check out our current featured room!</Link>
                </div>
            </div>
        )
    }
}

export default About;