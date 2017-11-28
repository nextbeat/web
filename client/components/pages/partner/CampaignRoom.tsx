import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { List, Map } from 'immutable'

import Spinner from '@components/shared/Spinner.tsx'

import { loadCampaignRoom, loadCampaign } from '@actions/pages/partner'
import Partner from '@models/state/pages/partner'
import Campaign from '@models/entities/campaign'
import CampaignStack, { CampaignMediaItemProps } from '@models/entities/campaignStack'
import { State, DispatchProps, RouteProps } from '@types'
import { timeString } from '@utils'

interface ConnectProps {
    isFetching: boolean
    hasFetched: boolean
    hasFetchedCampaign: boolean
    error: string
    campaign: Campaign
    campaignStack: CampaignStack
}

interface Params {
    campaignId: number
    roomHid: string
}
type Props = ConnectProps & DispatchProps & RouteProps<Params>

class CampaignRoom extends React.Component<Props> {

    componentDidMount() {
        const { dispatch, hasFetchedCampaign, params: { campaignId, roomHid } } = this.props
        dispatch(loadCampaignRoom(campaignId, roomHid))
        if (!hasFetchedCampaign) {
            dispatch(loadCampaign(campaignId))
        }
    }

    renderCampaignMediaItem(m: Map<keyof CampaignMediaItemProps, any>, idx: number) {
        if (m.get('type') !== 'video') {
            return null;
        }

        const pctWatched = Math.min(100, Math.floor((m.get('total_watch_duration')/m.get('user_count'))*100/m.get('duration')))

        return (
            <tr className="studio_campaign_media-item" key={m.get('id')}>
                <td>{idx+1}</td>
                <td>{timeString(m.get('total_watch_duration'))}</td>
                <td>{pctWatched}%</td>
                <td>{timeString(m.get('duration'))}</td>
            </tr>
        )
    }

    render() {
        const { campaign, campaignStack, isFetching, hasFetched, error } = this.props
        const campaignUrl = `/studio/campaigns/${campaign.get('id')}`
        const roomUrl = `/r/${campaignStack.get('hid')}`

        const avgSessionTime = Math.floor(campaignStack.get('session_duration')/campaignStack.get('session_count'))
        let topSessionTime = avgSessionTime 
        if (campaignStack.get('high_activity_session_count') > 0) {
            topSessionTime = Math.floor(campaignStack.get('high_activity_session_duration')/campaignStack.get('high_activity_session_count'))
        } 
        
        return (
            <div>
                { hasFetched && 
                    <div>
                        <div className="studio_header">
                            <div className="studio_title">
                                <Link to="/studio">Campaigns</Link> > <Link to={campaignUrl}>{campaign.get('name')}</Link> > <span className="studio_title-selected">{campaignStack.get('description')}</span>
                            </div>
                            <div className="studio_header_right">
                                <Link to={roomUrl}>View room</Link>
                            </div>
                        </div>
                        <div className="studio_marquee">
                            <div className="studio_marquee_item">
                                <div className="studio_marquee_item_title">
                                    AVERAGE SESSION TIME
                                </div>
                                <div className="studio_marquee_item_text">
                                    {timeString(avgSessionTime)}
                                </div>
                            </div>
                            <div className="studio_marquee_item">
                                <div className="studio_marquee_item_title">
                                    TOP 10% AVERAGE SESSION TIME
                                </div>
                                <div className="studio_marquee_item_text">
                                    {timeString(topSessionTime)}
                                </div>
                            </div>
                        </div>
                        <table className="studio_table studio_campaign-media-items">
                            <thead>
                                <tr>
                                    <th>Index</th>
                                    <th>Total Watch Time</th>
                                    <th>Avg % Watched</th>
                                    <th>Video Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaignStack.get('media_items', List()).map((m, idx) => this.renderCampaignMediaItem(m, idx))}
                            </tbody>
                        </table>
                    </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isFetching: Partner.get(state, 'isFetchingCampaignStack'),
        hasFetched: Partner.get(state, 'hasFetchedCampaignStack'),
        hasFetchedCampaign: Partner.get(state, 'hasFetchedCampaign'),
        error: Partner.get(state, 'campaignStackError'),
        campaign: Partner.selectedCampaign(state),
        campaignStack: Partner.selectedCampaignStack(state),
    }
}

export default connect(mapStateToProps)(CampaignRoom)