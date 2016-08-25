import { ActionTypes, Status } from '../actions'

// Middleware function which handles 
// the upload process to S3
export default store => next => action => {

    if (action.type !== ActionTypes.UPLOAD_FILE) {
        return next(action)
    }

    
}