import { Map, fromJS } from 'immutable'
import { ActionTypes, Status } from '../../actions'
import { combineReducers, entity, paginate } from '../utils'

function uploadFile(state, action) {
    state = state.set('status', action.status)
    if (action.status === Status.REQUESTING) {

        state = state.merge({
            file: action.file,
            progress: action.progress
        })
        if (action.mediaItem) {
            state = state.set('mediaItem', Map(action.mediaItem))
        }
        return state

    } else if (action.status === Status.SUCCESS) {

        return state.merge({
            progress: 1
        })

    }
    return state
}

// id === -1 indicates that the user has selected to create a new stack
// id === null indicates that the user has deselected all stacks
function selectStackForUpload(state, action) {
    if (action.id === null) {
        return state.delete('selectedStackId')
    } else {
        return state.merge({
            selectedStackId: action.id
        })
    }
}

function updateNewStack(state, action) {
    return state.merge({
        newStack: state.get('newStack').merge(fromJS(action.stack))
    })
}

function updateNewMediaItem(state, action) {
    return state.merge({
        mediaItem: state.get('mediaItem').merge(fromJS(action.mediaItem))
    })
}

function submitStackRequest(state, action) {
    return state.merge({
        submitStackRequested: true
    })
}

function syncStacks(state, action) {
    if (action.submitting) {
        if (action.status === Status.REQUESTING) {
            return state.merge({
                submitStackRequested: false,
                isSubmittingStack: true,
                stackSubmitted: false
            })
        } else if (action.status === Status.SUCCESS) {
            return state.merge({
                submitStackRequested: false,
                isSubmittingStack: false,
                stackSubmitted: true
            })
        } else if (action.status === Status.FAILURE) {
            return state.merge({
                submitStackRequested: false,
                isSubmittingStack: false,
                stackSubmitted: false,
                submitStackError: 'Unable to submit room.'
            })
        }
    }
    return state
}

const initialState = fromJS({
    newStack: {
        title: '',
        tags: [],
        privacyStatus: 'public'
    }
})

export default function(state=initialState, action) {
    if (action.type === ActionTypes.CLEAR_UPLOAD) {
        return initialState
    } else if (action.type === ActionTypes.UPLOAD_FILE) {
        return uploadFile(state, action)
    } else if (action.type === ActionTypes.SELECT_STACK_FOR_UPLOAD) {
        return selectStackForUpload(state, action)
    } else if (action.type === ActionTypes.UPDATE_NEW_STACK) {
        return updateNewStack(state, action)
    } else if (action.type === ActionTypes.UPDATE_NEW_MEDIA_ITEM) {
        return updateNewMediaItem(state, action)
    } else if (action.type === ActionTypes.SUBMIT_STACK_REQUEST) {
        return submitStackRequest(state, action)
    } else if (action.type === ActionTypes.SYNC_STACKS) {
        return syncStacks(state, action)
    }
    return state
}