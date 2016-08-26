import { Map } from 'immutable'
import { ActionTypes, Status } from '../../actions'
import { combineReducers, entity, paginate } from '../utils'

function uploadFile(state, action) {
    state = state.set('status', action.status)
    if (action.status === Status.REQUESTING) {
        return state.merge({
            fileName: action.file.name,
            progress: action.progress
        })
    } else if (action.status === Status.REQUESTING) {
        return state.merge({
            progress: 1
        })
    }
    return state;
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_UPLOAD) {
        return Map()
    } else if (action.type === ActionTypes.UPLOAD_FILE) {
        return uploadFile(state, action)
    }
    return state;
}