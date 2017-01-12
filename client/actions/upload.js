import ActionTypes from './types'
import { API_CALL, API_CANCEL, UploadTypes } from './types'
import { generateUuid } from '../utils'

/********
 * UPLOAD
 ********/

export function uploadMediaItemFile(file) {
   return {
        type: ActionTypes.UPLOAD_FILE,
        uploadType: UploadTypes.MEDIA_ITEM,
        file
    }
}

export function uploadThumbnail(file) {
    return {
        type: ActionTypes.UPLOAD_FILE,
        uploadType: UploadTypes.THUMBNAIL,
        file
    }
}

export function uploadProfilePicture(file) {
    return {
        type: ActionTypes.UPLOAD_FILE,
        uploadType: UploadTypes.PROFILE_PICTURE,
        file
    }
}

export function uploadCoverImage(file) {
    return {
        type: ActionTypes.UPLOAD_FILE,
        uploadType: UploadTypes.COVER_IMAGE,
        file
    }
}

export function initiateProcessingStage(type) {
    return {
        type: ActionTypes.INITIATE_PROCESSING_STAGE,
        uploadType: type
    }
}

export function updateProcessingProgress({ progress, timeLeft, completed, uploadType }) {
    return {
        type: ActionTypes.UPDATE_PROCESSING_PROGRESS,
        uploadType,
        progress,
        timeLeft,
        completed
    }
}

export function stopFileUpload(error, type) {
    return {
        type: ActionTypes.STOP_FILE_UPLOAD,
        uploadType: type,
        error
    }
}

export function clearFileUpload(type) {
    return {
        type: ActionTypes.CLEAR_FILE_UPLOAD,
        uploadType: type
    }
}


/******************
 * STACK SUBMISSION
 ******************/

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