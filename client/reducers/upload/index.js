import { Map, fromJS } from 'immutable'
import { ActionTypes, Status } from '../../actions'
import { combineReducers, entity, paginate } from '../utils'

/**
 * Upload state has the form:
 * {
 *    uploads: { <object of ongoing uploads where key is the upload type> },
 *    submission: { <object with state information about new media item submission> }
 * }
 */

function uploadFile(state, action) {

    let fileState = state.getIn(['uploads', action.uploadType], Map())
    fileState = fileState.set('status', action.status)

    if (action.status === Status.REQUESTING) {

        fileState = fileState.merge({
            file: action.file,
            uploadProgress: action.progress,
            uploadComplete: false,
        }).delete('error')

        if (action.xhr) {
            fileState = fileState.set('xhr', action.xhr)
        }

        if (action.url) {
            fileState = fileState.set('url', action.url)
        }

    } else if (action.status === Status.SUCCESS) {

        fileState = fileState.merge({
            uploadProgress: 1,
            uploadComplete: true
        })

    } else if (action.status === Status.FAILURE) {

        fileState = fileState.merge({
            uploadProgress: 0,
            uploadComplete: false,
            error: action.error
        }).delete('file')

    }

    if (action.mediaItem) {
        state = state.update('submission', mState => mState.set('mediaItem', Map(action.mediaItem)))
    }

    return state.setIn(['uploads', action.uploadType], fileState)
}

function stopFileUpload(state, action) {
    return state.updateIn(['uploads', action.uploadType], fileState => {
        return fileState.merge({
            uploadProgress: 0,
            error: action.error,
            uploadComplete: false
        }).delete('file')
    })
}

function clearFileUpload(state, action) {
    return state.deleteIn(['uploads', action.uploadType])
}

function updateProcessingProgress(state, action) {
    return state.updateIn(['uploads', action.uploadType], fileState => {
        return fileState.merge({
            processingProgress: action.progress,
            processingTimeLeft: action.timeLeft,
            processingComplete: action.completed
        })
    })
}

/******************
 * STACK SUBMISSION
 ******************/

// id === -1 indicates that the user has selected to create a new stack
// id === null indicates that the user has deselected all stacks
function selectStackForUpload(state, action) {
    if (action.id === null) {
        return state.deleteIn(['submission', 'selectedStackId'])
    } else {
        if (action.id === -1) {
            state = state.setIn(['submission', 'newStack', 'uuid'], action.uuid)
        }
        return state.setIn(['submission', 'selectedStackId'], action.id);
    }
}

function updateNewStack(state, action) {
    return state.update('submission', sState => {
        return sState.update('newStack', newStack => newStack.merge(fromJS(action.stack)))
    })
}

function updateNewMediaItem(state, action) {
    return state.update('submission', sState => {
        return sState.update('mediaItem', mediaItem => mediaItem.merge(fromJS(action.mediaItem)))
    })
}

function submitStackRequest(state, action) {
    return state.setIn(['submission', 'submitStackRequested'], true)
}

function syncStacks(state, action) {
    let sState = state.get('submission', Map())
    if (action.submitting) {
        if (action.status === Status.REQUESTING) {
            sState = sState.merge({
                submitStackRequested: false,
                isSubmittingStack: true,
                stackSubmitted: false
            })
        } else if (action.status === Status.SUCCESS) {
            // if we're creating a new stack, we update the selected stack id
            // with the id of the stack returned in the sync process
            if (sState.get('selectedStackId') === -1) {
                let stacks = action.response.entities.stacks 
                let selectedStackId = -1

                for (let stackId in stacks) {
                    if (stacks[stackId].uuid === sState.getIn(['newStack', 'uuid'])) {
                        selectedStackId = stackId;
                        break;
                    }
                }

                sState = sState.set('selectedStackId', selectedStackId)
            }
            sState = sState.merge({
                submitStackRequested: false,
                isSubmittingStack: false,
                stackSubmitted: true
            })
        } else if (action.status === Status.FAILURE) {
            sState = sState.merge({
                submitStackRequested: false,
                isSubmittingStack: false,
                stackSubmitted: false,
                submitStackError: 'Unable to submit room.'
            })
        }
    }
    return state.set('submission', sState)
}

const initialState = fromJS({
    uploads: {},
    submission: {
        newStack: {
            title: '',
            tags: [],
            privacyStatus: 'public'
        }
    }
})

export default function(state=initialState, action) {
    if (action.type === ActionTypes.CLEAR_UPLOAD) {
        return initialState
    } else if (action.type === ActionTypes.UPLOAD_FILE) {
        return uploadFile(state, action)
    } else if (action.type === ActionTypes.UPDATE_PROCESSING_PROGRESS) {
        return updateProcessingProgress(state, action)
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
    } else if (action.type === ActionTypes.STOP_FILE_UPLOAD) {
        return stopFileUpload(state, action)
    } else if (action.type === ActionTypes.CLEAR_FILE_UPLOAD) {
        return clearFileUpload(state, action)
    }
    return state
}