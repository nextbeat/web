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
                <div className="advertising_nextbeat">
                    <div className="advertising_content advertising_nextbeat_content">
                        <div className="advertising_text advertising_nextbeat_text">
                            <div className="advertising_nextbeat_section">
                                <h1>How does Nextbeat work?</h1>
                                <p>Nextbeat is a video platform created by Youtubers for Youtubers, built to attract highly influential creators via a first-hand understanding of the problems they face, and run by influencers with social access to an elite tier of creators.</p>
                                <p>On Nextbeat, creators can open a room and upload a series of short, punchy videos over the course of a few hours or a day, directly engaging their audience and fulfilling viewer requests with short video replies.</p>
                            </div>
                            <div className="advertising_nextbeat_section">
                                <h1>Users hang out.</h1>
                                <p>Because of Nextbeat's unique live-update format, audiences are left with time to kill between video drops. This downtime can be used to drive active buyers to your brand.</p>
                            </div>
                        </div>
                        <div className="advertising_stats_column">
                            <div className="advertising_stats">
                                <div className="advertising_stat_group">
                                    <div className="advertising_stat_group_title">AVERAGE PERCENT OF EACH VIDEO WATCHED</div>
                                    <div className="advertising_stat_group_body">
                                        <div className="advertising_stat">
                                            <div className="advertising_stat_value">82%</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="advertising_stat_group">
                                    <div className="advertising_stat_group_title">AVERAGE NUMBER OF VIDEOS PER ROOM</div>
                                    <div className="advertising_stat_group_body">
                                        <div className="advertising_stat">
                                            <div className="advertising_stat_value">20</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="advertising_stat_group">
                                    <div className="advertising_stat_group_title">MINUTES SPENT IN ROOM PER USER</div>
                                    <div className="advertising_stat_group_body advertising_stat_group_body-multiple">
                                        <div className="advertising_stat">
                                            <div className="advertising_stat_value">8:09</div>
                                            <div className="advertising_stat_label">AVERAGE</div>
                                        </div>
                                        <div className="advertising_stat">
                                            <div className="advertising_stat_value">52:55</div>
                                            <div className="advertising_stat_label">TOP 10%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="advertising_store">
                    <div className="advertising_store_header advertising_text">
                        <h1>Why partner with Nextbeat?</h1>
                    </div>
                    <div className="advertising_content advertising_store_content">
                        <div className="advertising_store_item">
                            <div className="advertising_store_icon advertising_store_icon-partnerships" />
                            <div className="advertising_text advertising_store_text">
                                <h2>Strategic Partnerships</h2>
                                <p>Align your brand with influential creators who speak directly into the ears of their millions of avid followers. Gain access to a young, enthusiastic demographic who view these content creators as equal parts idol and virtual best friend, and who take their recommendations very seriously.</p>
                            </div>
                        </div>
                        <div className="advertising_store_item">
                            <div className="advertising_store_icon advertising_store_icon-conversions" />
                            <div className="advertising_text advertising_store_text">
                                <h2>Seamless Conversions</h2>
                                <p>Unlike Youtube sponsorships, Nextbeat's integrated Shop tab makes it easy for consumers to convert tentative interest into tangible clickthroughs and purchases. Products featured in our Shop tab are easily accessible, and Nextbeat's low-maintenance format makes it possible for users to explore sponsored content without fear of getting left behind.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="advertising_action">
                    <div className="advertising_text advertising_action_text">
                        <p>We can place you in rooms with YouTube influencers Safiya Nygaard and Tyler Williams, who have a combined following of over 4 million subscribers.</p>
                        <p>Included will be detailed analytics reports to track the performance of your store, total impressions, and other ads.</p>
                    </div>
                    <Link to="/company/contact" className="advertising_action_button company_button">To learn more, contact us.</Link>
                </div>
            </div>
        )
    }
}

export default Advertising;