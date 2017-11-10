import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { List } from 'immutable'

import Spinner from '@components/shared/Spinner.tsx'

import { loadPartner } from '@actions/pages/partner'
import Partner from '@models/state/pages/partner'
import Campaign from '@models/entities/campaign'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    isFetching: boolean
    hasFetched: boolean
    error: string
    campaigns: List<Campaign>
}

type Props = ConnectProps & DispatchProps

class Studio extends React.Component<Props> {

    componentDidMount() {
        this.props.dispatch(loadPartner())
    }

    renderCampaign(campaign: Campaign) {
        return (
            <tr key={campaign.get('id')}>
                <td><Link to={`studio/campaigns/${campaign.get('id')}`}>{ campaign.get('name') }</Link></td>
                <td>$0/${campaign.get('goal')}</td>
            </tr>
        )
    }

    render() {
        const { campaigns, isFetching, hasFetched, error } = this.props
        return (
            <div>
                { hasFetched && 
                    <div>
                        <div className="studio_header">
                            <div className="studio_title">
                                <span className="studio_title-selected">Campaigns</span>
                            </div>
                        </div>
                        <table className="studio_table studio_campaigns">
                            <thead>
                                <tr>
                                    <th>Campaign</th>
                                    <th>Goal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.map(c => this.renderCampaign(c))}
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
        isFetching: Partner.get(state, 'isFetchingPartner'),
        hasFetched: Partner.get(state, 'hasFetchedPartner'),
        error: Partner.get(state, 'partnerError'),
        campaigns: Partner.campaigns(state)
    }
}

export default connect(mapStateToProps)(Studio)