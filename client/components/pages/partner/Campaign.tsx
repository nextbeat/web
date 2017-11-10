import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { List } from 'immutable'
import * as format from 'date-fns/format'

import Spinner from '@components/shared/Spinner.tsx'

import { loadCampaign } from '@actions/pages/partner'
import Partner from '@models/state/pages/partner'
import Campaign from '@models/entities/campaign'
import CampaignStack from '@models/entities/campaignStack'
import { State, DispatchProps, RouteProps } from '@types'

interface ConnectProps {
    isFetching: boolean
    hasFetched: boolean
    error: string
    campaign: Campaign
    campaignStacks: List<CampaignStack>
}

interface Params {
    id: number
}
type Props = ConnectProps & DispatchProps & RouteProps<Params>

class CampaignComponent extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.renderCampaignStack = this.renderCampaignStack.bind(this);
    }

    componentDidMount() {
        this.props.dispatch(loadCampaign(this.props.params.id))
    }

    renderCampaignStack(s: CampaignStack) {
        const url = `/studio/campaigns/${this.props.campaign.get('id')}/rooms/${s.get('hid')}`
        return (
            <tr className="studio_campaign_stack" key={s.get('id')}>
                <td>{s.get('username')}</td>
                <td><Link to={url}>{s.get('description')}</Link></td>
                <td>{s.get('session_count') || <span className="studio_not-available">n/a</span>}</td> 
                <td>{s.get('session_duration') || <span className="studio_not-available">n/a</span>}</td>
            </tr>
        )
    }

    render() {
        const { campaign, campaignStacks, isFetching, hasFetched, error } = this.props
        return (
            <div>
                { hasFetched && 
                    <div>
                        <div className="studio_header">
                            <div className="studio_title">
                                <Link to="/studio">Campaigns</Link> > <span className="studio_title-selected">{campaign.get('name')}</span>
                            </div>
                            <div className="studio_header_right">
                                {format(campaign.get('start_date'), 'MMM D, YYYY')} – {format(campaign.get('end_date'), 'MMM D, YYYY')}
                            </div>
                        </div>
                        <table className="studio_table studio_campaign-stacks">
                            <thead>
                                <tr>
                                    <th>Creator</th>
                                    <th>Room</th>
                                    <th>Sessions</th>
                                    <th>Total Session Time (mins)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaignStacks.map(s => this.renderCampaignStack(s))}
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
        isFetching: Partner.get(state, 'isFetchingCampaign'),
        hasFetched: Partner.get(state, 'hasFetchedCampaign'),
        error: Partner.get(state, 'campaignError'),
        campaign: Partner.selectedCampaign(state),
        campaignStacks: Partner.selectedCampaignStacks(state)
    }
}

export default connect(mapStateToProps)(CampaignComponent)