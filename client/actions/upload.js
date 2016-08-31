import { v4 as generateUuid } from 'node-uuid'
import ActionTypes from './types'

/********
 * UPLOAD
 ********/

export function uploadFile(file) {
    return {
        type: ActionTypes.UPLOAD_FILE,
        file
    }
}

export function uploadPosterFile(blob, key) {
    // Expects Blob object, not File object (which inherits Blob)
    return {
        type: ActionTypes.UPLOAD_POSTER_FILE,
        file: blob,
        key
    }
}

export function selectStackForUpload(stackId) {
    let uuid;
    if (stackId === -1) {
        // creating new stack, so generate uuid
        uuid = generateUuid()
    }
    return {
        type: ActionTypes.SELECT_STACK_FOR_UPLOAD,
        id: stackId,
        uuid
    }
}

export function updateNewStack(stack) {
    return {
        type: ActionTypes.UPDATE_NEW_STACK,
        stack
    }
}

export function updateNewMediaItem(mediaItem) {
    return {
        type: ActionTypes.UPDATE_NEW_MEDIA_ITEM,
        mediaItem
    }
}

export function submitStackRequest() {
    return { 
        type: ActionTypes.SUBMIT_STACK_REQUEST
    }
}


/*******
 * RESET
 *******/

export function clearUpload() {
    return {
        type: ActionTypes.CLEAR_UPLOAD
    }
}