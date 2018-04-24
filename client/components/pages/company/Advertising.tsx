import * as React from 'react'
import { Link } from 'react-router'

class Advertising extends React.Component {
    render() {
        return (
            <div className="advertising">
                <div className="advertising_intro">
                    <div className="advertising_intro_text">
                        <p>Partner with influencers,</p>
                        <p>reach engaged users,</p>
                        <p>and drive sales</p>
                        <p className="advertising_intro_text-downtime">on Nextbeat.</p>
                    </div>
                    <div className="advertising_intro_shape1" />
                    <div className="advertising_intro_shape2" />
                </div>
                <div className="advertising_nextbeat">
                    <div className="advertising_content advertising_nextbeat_content">
                        <div className="advertising_stats_column">
                            <div className="advertising_stats">
                                <div className="advertising_stat_group">
                                    <div className="advertising_stat_group_title">AVERAGE VISITS PER ROOM</div>
                                    <div className="advertising_stat_group_body">
                                        <div className="advertising_stat">
                                            <div className="advertising_stat_value">47,000</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="advertising_stat_group">
                                    <div className="advertising_stat_group_title">AVERAGE VIDEO VIEWS PER ROOM</div>
                                    <div className="advertising_stat_group_body">
                                        <div className="advertising_stat">
                                            <div className="advertising_stat_value">200,000</div>
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
                        <div className="advertising_text advertising_nextbeat_text">
                            <div className="advertising_nextbeat_section">
                                <h1>How does Nextbeat work?</h1>
                                <p>Nextbeat is a video platform created by Youtubers for Youtubers, designed to attract highly influential creators via a first-hand understanding of the problems they face.</p>
                                <p>Creators can open a Nextbeat room to upload a series of fun, low-maintenance video clips with their audience over a few hours or a day, sharing glimpses of their day-to-day life and fulfilling viewer requests with short video replies. Think of it as an interactive Instagram Story that builds revenue over time instead of disappearing overnight.</p>
                            </div>
                            <div className="advertising_nextbeat_section">
                                <h1>Why partner with Nextbeat?</h1>
                                <div className="advertising_nextbeat_subsection">
                                    <h2>Strategic Partnerships</h2>
                                    <p>Align your brand with influential creators who speak directly into the ears of their millions of avid followers. Gain access to a young, enthusiastic demographic who view these content creators as equal parts idol and virtual best friend, and who take their recommendations very seriously.</p>
                                </div>
                                <div className="advertising_nextbeat_subsection">
                                    <h2>Native Ad Integration</h2>
                                    <p>Because we host ad content directly on our servers (rather than bartering through an SSP), AdBlock software can't detect our ads, guaranteeing you 100% of our user impressions.</p>
                                </div>
                                <div className="advertising_nextbeat_subsection">
                                    <h2>Improved Clickability</h2>
                                    <p>On Youtube, even an interested viewer might forget about your product when your ad ends and the video begins. Nextbeat solves this problem by featuring our partnered brands in an integrated Shop tab, which remains accessible throughout the course of the Nextbeat room. Our media suite is also designed to be highly interactive, encouraging more user clicks and less listless, zoned-out viewing.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="advertising_action">
                    <div className="advertising_text advertising_action_text">
                        <p>We can place you in rooms with YouTube influencers Safiya Nygaard and Tyler Williams, who have a combined following of over 5 million subscribers.</p>
                        <p>Included will be detailed analytics reports to track the performance of your store, total impressions, and other ads.</p>
                    </div>
                    <Link to="/company/contact" className="advertising_action_button company_button">To learn more, contact us.</Link>
                </div>
            </div>
        )
    }
}

export default Advertising;