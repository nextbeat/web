import { normalize } from 'normalizr'
import { List } from 'immutable'

import { 
    ActionType,
    ApiCallAction,
    ApiCancelAction,
    GenericAction,
    ThunkAction,
    Status
} from '@actions/types'
import { syncStacks } from '@actions/user'
import { clearFileUpload } from '@actions/upload'
import Room from '@models/state/room'
import EditRoom, { RoomFields } from '@models/state/pages/editRoom'
import * as Schemas from '@schemas'
import { UploadType } from '@upload'

export type EditRoomActionAll = 
    EditRoomAction |
    UpdateEditRoomAction |
    UpdateTagsAction |
    UpdateThumbnailAction |
    UseDefaultThumbnailAction |
    ClearEditRoomAction 

/**********
 * FETCHING
 **********/

export interface EditRoomAction extends ApiCallAction {
    type: ActionType.EDIT_ROOM
}
function fetchEditRoom(hid: string): EditRoomAction {
    return {
        type: ActionType.EDIT_ROOM,
        API_CALL: {
            schema: Schemas.Stack,
            endpoint: `stacks/${hid}`,
            queries: { idAttribute: 'hid' },
        }
    }
}

// simulates a successful network call
function editRoomLoaded(room: any) {
    return {
        type: ActionType.EDIT_ROOM,
        status: Status.SUCCESS,
        response: normalize(room, Schemas.Stack)
    }
}

export function loadEditRoom(hid: string): ThunkAction {
    return (dispatch, getState) => {
        let roomId = Room.idForHid(getState(), hid)
        if (roomId > 0) {
            // room already loaded (e.g. navigated from room page)
            dispatch(editRoomLoaded(Room.entity(getState(), roomId).toJS()))
        } else {
            dispatch(fetchEditRoom(hid))
        }
    }
}


/********
 * UPDATE
 ********/

export interface UpdateEditRoomAction extends GenericAction {
    type: ActionType.UPDATE_EDIT_ROOM
    room: Partial<RoomFields>
}
export function updateEditRoom(room: Partial<RoomFields>): UpdateEditRoomAction {
    return {
        type: ActionType.UPDATE_EDIT_ROOM,
        room
    }
}

export function submitEditRoom(): ThunkAction {
    return (dispatch, getState) => {
        const state = getState()
        if (!EditRoom.isLoaded(state)) {
            return
        }

        let roomId = EditRoom.get(state, 'id')
        let upload = new Upload(getState())

        dispatch({ type: ActionType.SUBMIT_EDIT_ROOM })
        dispatch(syncStacks('open', false, EditRoom.stackForSubmission(state)))

        dispatch(postUpdateTags(roomId, EditRoom.get(state, 'roomFields').get('tags', List()).toJS()))
        if (EditRoom.get(state, 'useDefaultThumbnail')) {
            dispatch(postUpdateThumbnail(roomId, {}))
        } else if (upload.hasFile(UploadType.Thumbnail)) {
            dispatch(postUpdateThumbnail(roomId, {
                url: upload.get(UploadType.Thumbnail, 'url')
            }))
        }
    }
}

export interface UpdateTagsAction extends ApiCallAction {
    type: ActionType.UPDATE_TAGS
}
function postUpdateTags(roomId: number, tags: string[]): UpdateTagsAction {
    return {
        type: ActionType.UPDATE_TAGS,
        API_CALL: {
            method: 'POST',
            endpoint: `stacks/${roomId}/tags`,
            authenticated: true,
            body: { tags }
        }
    }
}

export interface UpdateThumbnailAction extends ApiCallAction {
    type: ActionType.UPDATE_THUMBNAIL
}
function postUpdateThumbnail(roomId: number, thumbnail: any): UpdateThumbnailAction {
    return {
        type: ActionType.UPDATE_THUMBNAIL,
        API_CALL: {
            method: 'POST',
            endpoint: `stacks/${roomId}/thumbnail`,
            authenticated: true,
            body: thumbnail
        }
    }
}

export interface UseDefaultThumbnailAction extends ApiCallAction {
    type: ActionType.USE_DEFAULT_THUMBNAIL
}
function fetchUseDefaultThumbnail(roomId: number): UseDefaultThumbnailAction {
    // Fetches most recent media item, 
    // so we can set it as the thumbnail on display
    return {
        type: ActionType.USE_DEFAULT_THUMBNAIL,
        API_CALL: {
            schema: Schemas.MediaItems,
            endpoint: `stacks/${roomId}/mediaitems`,
            queries: {
                order: 'desc'
            },
            pagination: {
                limit: 1
            }
        }
    }
}

export function useDefaultThumbnail(): ThunkAction {
    return (dispatch, getState) => {
        let id = EditRoom.get(getState(), 'id')
        if (!id) {
            return
        }
        dispatch(clearFileUpload(UploadType.Thumbnail))
        dispatch(fetchUseDefaultThumbnail(id))
    }
}


/*******
 * RESET
 *******/

export interface ClearEditRoomAction extends GenericAction {
    type: ActionType.CLEAR_EDIT_ROOM
}
export function clearEditRoom(): ClearEditRoomAction {
    return {
        type: ActionType.CLEAR_EDIT_ROOM
    }
}

