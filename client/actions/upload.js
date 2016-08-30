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

export function selectStackForUpload(stackId) {
    return {
        type: ActionTypes.SELECT_STACK_FOR_UPLOAD,
        id: stackId
    }
}

export function updateNewStack(stack) {
    return {
        type: ActionTypes.UPDATE_NEW_STACK,
        stack
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