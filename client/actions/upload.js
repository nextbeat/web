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


/*******
 * RESET
 *******/

export function clearUpload() {
    return {
        type: ActionTypes.CLEAR_UPLOAD
    }
}