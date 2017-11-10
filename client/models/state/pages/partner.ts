import { List } from 'immutable'

import { StateModelFactory } from '@models/state/base'
import Campaign from '@models/entities/campaign'
import CampaignStack from '@models/entities/campaignStack'
import { EntityProps, withEntityMap, createEntityListSelector, createSelector } from '@models/utils'
import { State } from '@types'

interface PartnerProps {
    isFetchingPartner: boolean
    hasFetchedPartner: boolean
    partnerError: string
    campaignIds: List<number>
    isFetchingCampaign: boolean
    hasFetchedCampaign: boolean
    campaignId: number
    campaignStackIds: List<number>
    campaignError: string
    isFetchingCampaignStack: boolean
    hasFetchedCampaignStack: boolean
    campaignStackError: string
    campaignStackId: number
}

const keyMap = {
    isFetchingPartner: ['meta', 'isFetching'],
    hasFetchedPartner: ['meta', 'hasFetched'],
    partnerError: ['meta', 'error'],
    campaignIds: ['meta', 'campaignIds'],
    isFetchingCampaign: ['campaign', 'isFetching'],
    hasFetchedCampaign: ['campaign', 'hasFetched'],
    campaignId: ['campaign', 'id'],
    campaignStackIds: ['campaign', 'stackIds'],
    campaignError: ['campaign', 'error'],
    isFetchingCampaignStack: ['campaign', 'stack', 'isFetching'],
    hasFetchedCampaignStack: ['campaign', 'stack', 'hasFetched'],
    campaignStackId: ['campaign', 'stack', 'id'],    
    campaignStackError: ['campaign', 'stack', 'error']
}

const keyMapPrefix = ['pages', 'partner']

export default class Partner extends StateModelFactory<PartnerProps>(keyMap, keyMapPrefix) {

    static campaigns = createEntityListSelector(Partner, 'campaignIds', Campaign)

    static selectedCampaign = createSelector(
        (state) => new Campaign(Partner.get(state, 'campaignId'), state.get('entities'))
    )(
        (state) => Partner.get(state, 'campaignId')
    )

    static selectedCampaignStacks = createEntityListSelector(Partner, 'campaignStackIds', CampaignStack)

    static selectedCampaignStack = createSelector(
        (state) => new CampaignStack(Partner.get(state, 'campaignStackId'), state.get('entities'))
    )(
        (state) => Partner.get(state, 'campaignStackId')
    )
}