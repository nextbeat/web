import * as React from 'react'
import { Link } from 'react-router'

class Advertising extends React.Component {
    render() {
        return (
            <div className="advertising">
                <div className="advertising_intro">
                    <div className="advertising_intro_text">
                        <p>Partner with influencers,</p>
                        <p>reach new users,</p>
                        <p>and drive sales with</p>
                        <p className="advertising_intro_text-downtime">downtime advertising.</p>
                    </div>
                    <div className="advertising_intro_shape1" />
                    <div className="advertising_intro_shape2" />
                </div>
                <div className="advertising_users">
                    <div className="advertising_content advertising_users_content">
                        <div className="advertising_users_stats">
                            <div className="advertising_users_stats_title">MINUTES SPENT IN ROOM PER USER</div>
                            <div className="advertising_users_stats_body">
                                <div className="advertising_users_stat">
                                    <div className="advertising_users_stat_time">7:58</div>
                                    <div className="advertising_users_stat_label">AVERAGE</div>
                                </div>
                                <div className="advertising_users_stat">
                                    <div className="advertising_users_stat_time">54:29</div>
                                    <div className="advertising_users_stat_label">TOP 10%</div>
                                </div>
                            </div>
                        </div>
                        <div className="advertising_text advertising_users_text">
                            <h1>Users hang out.</h1>
                            <p>Because of the unique way content is added to rooms on Nextbeat, audiences loiter and wait for new posts to arrive. This “downtime” can be used to drive active buyers to your brand.</p>
                        </div>
                    </div>
                </div>
                <div className="advertising_nextbeat">
                    <div className="advertising_nextbeat_container">
                        <div className="advertising_nextbeat_info advertising_text">
                            <h1>How does Nextbeat work?</h1>
                            <p>Nextbeat is a video platform. Creators host <b>rooms</b> where they post video updates over several hours for a wide audiences. We have a suite of community features which let creators and audiences engage interactively in real time.</p>
                            <p>On average, our featured creators upload 20 minutes of original video content over 3 hours in the form of multiple post updates.</p>
                        </div>
                        <div className="advertising_nextbeat_stats">
                            <div className="advertising_nextbeat_stat">Audiences watch an average of <b>82%</b> of each video</div>
                            <div className="advertising_nextbeat_stat">Average number of videos in a room: <b>20</b></div>
                        </div>
                    </div>
                </div>
                <div className="advertising_store">
                    <div className="advertising_content advertising_store_content">
                        <div className="advertising_text advertising_store_text">
                            <h1>Shopping while they wait.</h1>
                            <p>We have created in-room stores to entertain users during this downtime. Stores are positioned directly next to the influencers’ content, providing easy access to shopping. Commission proceeds are shared with creators.</p> 
                            <p>Stores let you partner with key influencers, while organically driving traffic to your product listings. Your store functions as additional entertainment for the audience.</p>
                        </div>
                        <div className="advertising_store_graphic">
                            {'<GRAPHIC>'}
                        </div>
                    </div>
                </div>
                <div className="advertising_action">
                    <div className="advertising_text advertising_action_text">
                        <h1>At this time, we are offering this space for free.</h1>
                        <p>We can place you in rooms with YouTube influencers Safiya Nygaard and Tyler Williams, who have a combined following of 4 million subscribers.</p>
                        <p>Included will be detailed analytics reports to track the performance of your store, total impressions, and other ads.</p>
                    </div>
                    <Link to="/company/contact" className="advertising_action_button">To learn more, contact us.</Link>
                </div>
            </div>
        )
    }
}

export default Advertising;