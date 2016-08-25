import { Map } from 'immutable'
import { ActionTypes, Status } from '../../actions'
import { combineReducers, entity, paginate } from '../utils'

export default function(state = Map(), action) {
    if (action === ActionTypes.UPLOAD_FILE) {
        return state.merge({
            fileName: action.file.name
        })
    }
    return state;
}