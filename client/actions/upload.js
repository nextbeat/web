import ActionTypes from './types'

export function uploadFile(file) {
    return {
        type: ActionTypes.UPLOAD_FILE,
        file
    }
}