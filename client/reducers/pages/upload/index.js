import { Map, fromJS } from 'immutable'
import { ActionTypes, Status } from '../../../actions'
import { combineReducers, entity, paginate } from '../../utils'

function uploadFile(state, action) {
    state = state.set('status', action.status)
    if (action.status === Status.REQUESTING) {

        state = state.merge({
            file: action.file,
            progress: action.progress
        }).delete('error')

        if (action.mediaItem) {
            state = state.set('mediaItem', Map(action.mediaItem))
        }
        if (action.xhr) {
            state = state.set('xhr', action.xhr)
        }

        return state

    } else if (action.status === Status.SUCCESS) {

        return state.merge({
            progress: 1
        })

    } else if (action.status === Status.FAILURE) {

        return state.merge({
            progress: 0,
            error: action.error
        }).delete('file')

    }
    return state
}

function uploadThumbnail(state, action) {
    if (action.status === Status.REQUESTING) {
        return state.merge({
            hasCustomThumbnail: true,
            isUploadingThumbnail: true,
            thumbnailUrl: action.url
        }).delete('hasUploadedThumbnail').delete('thumbnailUploadError')
    } else if (action.status === Status.SUCCESS) {
        return state.merge({
            isUploadingThumbnail: false,
            hasUploadedThumbnail: true
        })
    } else if (action.status === Status.FAILURE) {
        return state.merge({
            isUploadingThumbnail: false,
            hasUploadedThumbnail: false,
            thumbnailUploadError: action.error
        })
    }
    return state
}

function clearThumbnail(state, action) {
    return state.merge({
        hasCustomThumbnail: false
    })
}

// id === -1 indicates that the user has selected to create a new stack
// id === null indicates that the user has deselected all stacks
function selectStackForUpload(state, action) {
    if (action.id === null) {
        return state.delete('selectedStackId')
    } else {
        if (action.id === -1) {
            state = state.setIn(['newStack', 'uuid'], action.uuid)
        }
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
            // if we're creating a new stack, we update the selected stack id
            // with the id of the stack returned in the sync process
            if (state.get('selectedStackId') === -1) {
                let stacks = action.response.entities.stacks 
                let selectedStackId = -1

                for (let stackId in stacks) {
                    if (stacks[stackId].uuid === state.getIn(['newStack', 'uuid'])) {
                        selectedStackId = stackId;
                        break;
                    }
                }

                state = state.set('selectedStackId', selectedStackId)
            }
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
    } else if (action.type === ActionTypes.UPLOAD_THUMBNAIL) {
        return uploadThumbnail(state, action)
    } else if (action.type === ActionTypes.CLEAR_THUMBNAIL) {
        return clearThumbnail(state, action)
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