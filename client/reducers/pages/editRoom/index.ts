import { Map, fromJS } from 'immutable'
import pick from 'lodash-es/pick'
import { ActionType, Status, Action } from '@actions/types'
import { combineReducers, entity} from '@reducers/utils'
import { State } from '@types'
import { UploadType } from '@upload'

const meta = entity(ActionType.EDIT_ROOM);

function roomFields(state=Map(), action: Action) {
    if (action.type === ActionType.EDIT_ROOM && action.status === Status.SUCCESS && action.response) {
        let stack = action.response.entities.stacks[action.response.result]
        stack = pick(stack, ['description', 'tags', 'privacy_status'])
        return state.merge(fromJS(stack))
    } else if (action.type === ActionType.UPDATE_EDIT_ROOM) {
        return state.merge(fromJS(action.room))
    }
    return state
}

function submissionForField(state: State, action: Action, field: string) {
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

function submission(state=Map<string, any>(), action: Action) {
    if (action.type === ActionType.SYNC_STACKS) {
        return submissionForField(state, action, 'Fields')
    } else if (action.type === ActionType.UPDATE_TAGS) {
        return submissionForField(state, action, 'Tags')
    } else if (action.type === ActionType.UPDATE_THUMBNAIL) {
        return submissionForField(state, action, 'Thumbnail')
    }
    return state
}

function thumbnail(state=Map(), action: Action) {
    if (action.type === ActionType.USE_DEFAULT_THUMBNAIL) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                useDefault: true,
                fetchingDefault: true
            }).delete('latestMediaItemId')
        } else if (action.status === Status.SUCCESS && action.response) {
            return state.merge({
                fetchingDefault: false,
                latestMediaItemId: action.response.result[0]
            })
        }
    } else if (action.type === ActionType.UPLOAD_FILE && action.uploadType === UploadType.Thumbnail) {
        return state.set('useDefault', false)
    }
    return state
}

function roomChanged(state: State, action: Action) {
    if ((action.type === ActionType.UPLOAD_FILE 
            && action.uploadType === UploadType.Thumbnail
            && action.status === Status.SUCCESS)
        || action.type === ActionType.USE_DEFAULT_THUMBNAIL
        || action.type === ActionType.UPDATE_EDIT_ROOM)
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

export default function(state = Map(), action: Action) {
    if (action.type === ActionType.CLEAR_EDIT_ROOM) {
        return Map()
    } else {
        return combineReducers(reducers)(state, action)
    }
}