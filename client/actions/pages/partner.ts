import { normalize } from 'normalizr'
import { ApiCallAction, ApiCancelAction, ActionType, ThunkAction } from '@actions/types'
import CurrentUser from '@models/state/currentUser'
import * as Schemas from '@schemas'
import { Store, Dispatch } from '@types'

export type PartnerActionAll = 
    PartnerAction |
    CampaignAction |
    CampaignRoomAction |
    ClearPartnerAction

export interface PartnerAction extends ApiCallAction {
    type: ActionType.PARTNER
}
function fetchPartner(partnerId: number): PartnerAction {
    return {
        type: ActionType.PARTNER,
        API_CALL: {
            endpoint: `ads/advertiser/${partnerId}`,
            schema: Schemas.Campaigns
        }
    }
}

export function loadPartner(): ThunkAction {
    return (dispatch, getState) => {
        if (!CurrentUser.isLoggedIn(getState())) {
            return null;
        }
        let userId = CurrentUser.get(getState(), 'id')
        return dispatch(fetchPartner(userId))
    }
}

function onCampaignSuccessImmediate(store: Store, next: Dispatch, action: CampaignAction, response: any) {
    store.dispatch({
        type: ActionType.ENTITY_UPDATE,
        response: normalize(response.campaign, Schemas.Campaign)
    })
    store.dispatch({
        type: ActionType.ENTITY_UPDATE,
        response: normalize(response.stacks, Schemas.CampaignStacks)
    })
}

export interface CampaignAction extends ApiCallAction {
    type: ActionType.CAMPAIGN
    campaignId: number
}
export function loadCampaign(campaignId: number): CampaignAction {
    return {
        type: ActionType.CAMPAIGN,
        campaignId,
        API_CALL: {
            endpoint: `ads/campaigns/${campaignId}`,
            onSuccessImmediate: onCampaignSuccessImmediate
        }
    }
}

export interface CampaignRoomAction extends ApiCallAction {
    type: ActionType.CAMPAIGN_ROOM
    campaignId: number
    roomHid: string
}
export function loadCampaignRoom(campaignId: number, roomHid: string): CampaignRoomAction {
    return {
        type: ActionType.CAMPAIGN_ROOM,
        campaignId,
        roomHid,
        API_CALL: {
            endpoint: `ads/campaigns/${campaignId}/stacks/${roomHid}`,
            schema: Schemas.CampaignStack
        }
    }
}

export interface ClearPartnerAction extends ApiCancelAction {
    type: ActionType.CLEAR_PARTNER 
}
export function clearPartner(): ClearPartnerAction {
    return {
        type: ActionType.CLEAR_PARTNER,
        API_CANCEL: {
            actionTypes: [ActionType.PARTNER, ActionType.CAMPAIGN, ActionType.CAMPAIGN_ROOM]
        }
    }
}