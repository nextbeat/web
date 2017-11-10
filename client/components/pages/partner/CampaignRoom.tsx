import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { List } from 'immutable'

import Spinner from '@components/shared/Spinner.tsx'

import { loadCampaignRoom } from '@actions/pages/partner'
import Partner from '@models/state/pages/partner'
import Campaign from '@models/entities/campaign'
import CampaignStack from '@models/entities/campaignStack'
import { State, DispatchProps, RouteProps } from '@types'

interface ConnectProps {
    isFetching: boolean
    hasFetched: boolean
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
        const { dispatch, params: { campaignId, roomHid } } = this.props
        dispatch(loadCampaignRoom(campaignId, roomHid))
    }

    render() {
        const { campaign, campaignStack, isFetching, hasFetched, error } = this.props
        const campaignUrl = `/studio/campaigns/${campaign.get('id')}`
        const roomUrl = `/r/${campaignStack.get('hid')}`
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
                    </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isFetching: Partner.get(state, 'isFetchingCampaign'),
        hasFetched: Partner.get(state, 'hasFetchedCampaign'),
        error: Partner.get(state, 'campaignError'),
        campaign: Partner.selectedCampaign(state),
        campaignStack: Partner.selectedCampaignStack(state),
    }
}

export default connect(mapStateToProps)(CampaignRoom)