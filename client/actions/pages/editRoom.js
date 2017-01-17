import { normalize } from 'normalizr'
import { List } from 'immutable'

import ActionTypes from '../types'
import Schemas from '../../schemas'
import { Room, EditRoom, Upload } from '../../models'
import { API_CALL, API_CANCEL, Status, UploadTypes } from '../types'
import { syncStacks } from '../user'
import { clearFileUpload } from '../upload'


/**********
 * FETCHING
 **********/

function fetchEditRoom(hid) {
    return {
        type: ActionTypes.EDIT_ROOM,
        [API_CALL]: {
            schema: Schemas.STACK,
            endpoint: `stacks/${hid}`,
            queries: { idAttribute: 'hid' },
        }
    }
}

// simulates a successful network call
function editRoomLoaded(room) {
    return {
        type: ActionTypes.EDIT_ROOM,
        status: Status.SUCCESS,
        response: normalize(room, Schemas.STACK)
    }
}

export function loadEditRoom(hid) {
    return (dispatch, getState) => {
        let room = Room.roomWithHid(hid, getState())
        if (room) {
            // room already loaded (e.g. navigated from room page)
            dispatch(editRoomLoaded(room.entity().entityState().toJS()))
        } else {
            dispatch(fetchEditRoom(hid))
        }
    }
}


/********
 * UPDATE
 ********/

export function updateEditRoom(room) {
    return {
        type: ActionTypes.UPDATE_EDIT_ROOM,
        room
    }
}

export function submitEditRoom() {
    return (dispatch, getState) => {
        let editRoom = new EditRoom(getState())
        if (!editRoom.isLoaded()) {
            return
        }

        let roomId = editRoom.get('id')
        let upload = new Upload(getState())

        dispatch({ type: ActionTypes.SUBMIT_EDIT_ROOM })
        dispatch(syncStacks('open', false, editRoom.stackForSubmission()))

        dispatch(postUpdateTags(roomId, editRoom.get('roomFields').get('tags', List()).toJS()))
        if (editRoom.get('useDefaultThumbnail')) {
            dispatch(postUpdateThumbnail(roomId, {}))
        } else if (upload.hasFile(UploadTypes.THUMBNAIL)) {
            dispatch(postUpdateThumbnail(roomId, {
                url: upload.get(UploadTypes.THUMBNAIL, 'url')
            }))
        }
    }
}

function postUpdateTags(roomId, tags) {
    return {
        type: ActionTypes.UPDATE_TAGS,
        [API_CALL]: {
            method: 'POST',
            endpoint: `stacks/${roomId}/tags`,
            authenticated: true,
            body: { tags }
        }
    }
}

function postUpdateThumbnail(roomId, thumbnail) {
    console.log(roomId, thumbnail)
    return {
        type: ActionTypes.UPDATE_THUMBNAIL,
        [API_CALL]: {
            method: 'POST',
            endpoint: `stacks/${roomId}/thumbnail`,
            authenticated: true,
            body: thumbnail
        }
    }
}

function fetchUseDefaultThumbnail(roomId) {
    // Fetches most recent media item, 
    // so we can set it as the thumbnail on display
    return {
        type: ActionTypes.USE_DEFAULT_THUMBNAIL,
        [API_CALL]: {
            schema: Schemas.MEDIA_ITEMS,
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

export function useDefaultThumbnail() {
    return (dispatch, getState) => {
        let editRoom = new EditRoom(getState())
        if (!editRoom.get('id')) {
            return
        }
        dispatch(clearFileUpload(UploadTypes.THUMBNAIL))
        dispatch(fetchUseDefaultThumbnail(editRoom.get('id')))
    }
}


/*******
 * RESET
 *******/

export function clearEditRoom() {
    return {
        type: ActionTypes.CLEAR_EDIT_ROOM
    }
}

