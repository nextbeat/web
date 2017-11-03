import { Map, fromJS } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { 
    UploadFileAction,
    UpdateProcessingProgressAction,
    SelectStackForUploadAction,
    UpdateNewStackAction,
    UpdateNewMediaItemAction,
    SubmitStackRequestAction,
    StopFileUploadAction,
    ClearFileUploadAction,
    ReferencedCommentAction
} from '@actions/upload'
import { SyncStacksAction } from '@actions/user'
import { combineReducers, entity, paginate } from '@reducers/utils'
import { State } from '@types'
import { UploadType } from '@upload'

interface UploadStateProps {
    uploads: { [key: string]: any }
    submission: {
        newStack: {
            title: string
            tags: string[]
            privacyStatus: string
        }
    }
}

type UploadState = Map<keyof UploadStateProps, any>

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

/**
 * Upload state has the form:
 * {
 *    uploads: { <object of ongoing uploads where key is the upload type> },
 *    submission: { <object with state information about new media item submission> }
 * }
 */

function uploadFile(state: UploadState, action: UploadFileAction) {

    let fileState = state.getIn(['uploads', action.uploadType], Map())
    fileState = fileState.set('status', action.status)

    if (action.status === Status.REQUESTING) {

        fileState = fileState.merge({
            file: action.file,
            uploadProgress: action.progress,
            uploadComplete: false,
            processingProgress: 0
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
            error: action.error.message
        }).delete('file')

    }

    if (action.mediaItem) {
        state = state.update('submission', mState => mState.set('mediaItem', Map(action.mediaItem)))
    }

    return state.setIn(['uploads', action.uploadType], fileState)
}

function stopFileUpload(state: State, action: StopFileUploadAction) {
    return state.updateIn(['uploads', action.uploadType], fileState => {
        return fileState.merge({
            uploadProgress: 0,
            error: action.error.message,
            uploadComplete: false
        }).delete('file')
    })
}

function clearFileUpload(state: State, action: ClearFileUploadAction) {
    state = state.deleteIn(['uploads', action.uploadType])
    if (action.uploadType === UploadType.MediaItem) {
        // also clear stack submission
        state = state.update('submission', sState => 
            Map()
                .set('referencedComment', sState.get('referencedComment'))
                .set('newStack', Map(initialState.newStack))
        )
    }
    return state
}

function updateProcessingProgress(state: UploadState, action: UpdateProcessingProgressAction) {
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
function selectStackForUpload(state: UploadState, action: SelectStackForUploadAction) {
    if (action.id === null) {
        return state.deleteIn(['submission', 'selectedStackId'])
    } else {
        if (action.id === -1) {
            state = state.setIn(['submission', 'newStack', 'uuid'], action.uuid)
        }
        return state.setIn(['submission', 'selectedStackId'], action.id);
    }
}

function updateNewStack(state: UploadState, action: UpdateNewStackAction) {
    return state.update('submission', sState => {
        return sState.update('newStack', (newStack: State) => newStack.merge(fromJS(action.stack)))
    })
}

function updateNewMediaItem(state: UploadState, action: UpdateNewMediaItemAction) {
    return state.update('submission', sState => {
        return sState.update('mediaItem', (mediaItem: State) => mediaItem.merge(fromJS(action.mediaItem)))
    })
}

function submitStackRequest(state: UploadState, action: SubmitStackRequestAction) {
    return state.setIn(['submission', 'submitStackRequested'], true)
}

function syncStacks(state: UploadState, action: SyncStacksAction) {
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
                let stacks = (action.response as any).entities.stacks 
                let selectedStackId = -1

                for (let stackId in stacks) {
                    if (stacks[stackId].uuid === sState.getIn(['newStack', 'uuid'])) {
                        selectedStackId = parseInt(stackId, 10);
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


/**********************
 * REFERENCING COMMENTS
 **********************/

function referencedComment(state: UploadState, action: ReferencedCommentAction) {
    let cState = state.getIn(['submission', 'referencedComment'], Map());
    if (action.status === Status.REQUESTING) {
        cState = cState.merge({
            isFetching: true,
            hasFetched: false,
        }).delete('error').delete('id')
    } else if (action.status === Status.SUCCESS) {
        cState = cState.merge({
            isFetching: false,
            hasFetched: true,
            id: action.commentId
        })
    } else if (action.status === Status.FAILURE) {
        cState = cState.merge({
            isFetching: false,
            hasFetched: true,
            error: action.error
        })
    }
    state = state.setIn(['submission', 'referencedComment'], cState);

    // Update other submission fields
    if (action.status === Status.SUCCESS && action.response) {
        const stackId = action.response.entities.comments[action.response.result].stack_id
        state = state.setIn(['submission', 'selectedStackId'], stackId)
    }

    return state
}

export default function(state=initialState, action: Action) {
    if (action.type === ActionType.CLEAR_UPLOAD) {
        return initialState
    } else if (action.type === ActionType.UPLOAD_FILE) {
        return uploadFile(state, action)
    } else if (action.type === ActionType.UPDATE_PROCESSING_PROGRESS) {
        return updateProcessingProgress(state, action)
    } else if (action.type === ActionType.SELECT_STACK_FOR_UPLOAD) {
        return selectStackForUpload(state, action)
    } else if (action.type === ActionType.UPDATE_NEW_STACK) {
        return updateNewStack(state, action)
    } else if (action.type === ActionType.UPDATE_NEW_MEDIA_ITEM) {
        return updateNewMediaItem(state, action)
    } else if (action.type === ActionType.SUBMIT_STACK_REQUEST) {
        return submitStackRequest(state, action)
    } else if (action.type === ActionType.SYNC_STACKS) {
        return syncStacks(state, action)
    } else if (action.type === ActionType.STOP_FILE_UPLOAD) {
        return stopFileUpload(state, action)
    } else if (action.type === ActionType.CLEAR_FILE_UPLOAD) {
        return clearFileUpload(state, action)
    } else if (action.type === ActionType.REFERENCED_COMMENT) {
        return referencedComment(state, action)
    }
    return state
}