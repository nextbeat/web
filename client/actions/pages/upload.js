import ActionTypes from '../types'
import { API_CALL, API_CANCEL } from '../types'
import { generateUuid } from '../../utils'

/********
 * UPLOAD
 ********/

export function uploadFile(file) {
    return {
        type: ActionTypes.UPLOAD_FILE,
        file
    }
}

// export function processUploadedFile(url, type) {
//     return {
//         type: ActionTypes.PROCESS_UPLOADED_FILE,
//         [API_CALL]: {
//             method: 'POST',
//             authenticated: true,
//             endpoint: 'upload/process',
//             body: {
//                 url,
//                 type
//             }
//         }
//     }
// }

export function updateProcessingProgress({ progress, timeLeft, completed }) {
    return {
        type: ActionTypes.UPDATE_PROCESSING_PROGRESS,
        progress,
        timeLeft,
        completed
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

export function uploadThumbnail(file, key) {
    return {
        type: ActionTypes.UPLOAD_THUMBNAIL,
        file,
        key
    }
}

export function clearThumbnail() {
    return {
        type: ActionTypes.CLEAR_THUMBNAIL
    }
}

export function uploadProfilePicture(file, key) {
    return {
        type: ActionTypes.UPLOAD_PROFILE_PICTURE,
        file,
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