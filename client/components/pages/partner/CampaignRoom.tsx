import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import Spinner from '@components/shared/Spinner.tsx'

import { loadCampaignRoom } from '@actions/pages/partner'
import Partner from '@models/state/pages/partner'
import CampaignStack from '@models/entities/campaignStack'
import { State, DispatchProps, RouteProps } from '@types'

interface ConnectProps {
    isFetching: boolean
    hasFetched: boolean
    error: string
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
        const { campaignStack, isFetching, hasFetched, error } = this.props
        return (
            <div>
                { isFetching && <Spinner styles={["grey"]} />}
                { hasFetched && 
                    <div className="studio_campaign_room">
                        {campaignStack.get('hid')}
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
        campaignStack: Partner.selectedCampaignStack(state),
    }
}

export default connect(mapStateToProps)(CampaignRoom)