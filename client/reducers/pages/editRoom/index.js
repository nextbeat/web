import { Map, fromJS } from 'immutable'
import pick from 'lodash/pick'
import { ActionTypes, Status, UploadTypes } from '../../../actions'
import { combineReducers, entity} from '../../utils'

const meta = entity(ActionTypes.EDIT_ROOM);

function roomFields(state=Map(), action) {
    if (action.type === ActionTypes.EDIT_ROOM && action.status === Status.SUCCESS) {
        let stack = action.response.entities.stacks[action.response.result]
        stack = pick(stack, ['description', 'tags', 'privacy_status'])
        return state.merge(stack)
    } else if (action.type === ActionTypes.UPDATE_EDIT_ROOM) {
        return state.merge(fromJS(action.room))
    }
    return state
}

function submissionForField(state, action, field) {
    let isSubmittingKey = `isSubmitting${field}`
    let hasSubmittedKey = `hasSubmitted${field}`
    let submitErrorKey = `submit${field}Error`

    if (action.status === Status.REQUESTING) {
        return state.merge({
            [isSubmittingKey]: true,
            [hasSubmittedKey]: false,
        }).delete(submitErrorKey)
    } else if (action.status === Status.SUCCESS) {
        return state.merge({
            [isSubmittingKey]: false,
            [hasSubmittedKey]: true
        })
    } else if (action.status === Status.FAILURE) {
        return state.merge({
            [isSubmittingKey]: false,
            [hasSubmittedKey]: false,
            [submitErrorKey]: action.error.message
        })
    }
    return state
}

function submission(state=Map(), action) {
    if (action.type === ActionTypes.SYNC_STACKS) {
        return submissionForField(state, action, 'Fields')
    } else if (action.type === ActionTypes.UPDATE_TAGS) {
        return submissionForField(state, action, 'Tags')
    } else if (action.type === ActionTypes.UPDATE_THUMBNAIL) {
        return submissionForField(state, action, 'Thumbnail')
    }
    return state
}

function thumbnail(state=Map(), action) {
    if (action.type === ActionTypes.USE_DEFAULT_THUMBNAIL) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                useDefault: true,
                fetchingDefault: true
            }).delete('latestMediaItemId')
        } else if (action.status === Status.SUCCESS) {
            return state.merge({
                fetchingDefault: false,
                latestMediaItemId: action.response.result[0]
            })
        }
    } else if (action.type === ActionTypes.UPLOAD_FILE && action.uploadType === UploadTypes.THUMBNAIL) {
        return state.set('useDefault', false)
    }
    return state
}

function roomChanged(state, action) {
    if ((action.type === ActionTypes.UPLOAD_FILE 
            && action.uploadType === UploadTypes.THUMBNAIL 
            && action.status === Status.SUCCESS)
        || action.type === ActionTypes.USE_DEFAULT_THUMBNAIL
        || action.type === ActionTypes.UPDATE_EDIT_ROOM)
    {
        return true;
    }
    return state;
}

const reducers = {
    meta,
    roomFields,
    submission,
    thumbnail,
    roomChanged,
}

export default function(state = Map(), action) {
    if (action.type === ActionTypes.CLEAR_EDIT_ROOM) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}