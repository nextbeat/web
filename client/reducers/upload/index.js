import { Map, fromJS } from 'immutable'
import { ActionTypes, Status } from '../../actions'
import { combineReducers, entity, paginate } from '../utils'

function uploadFile(state, action) {
    state = state.set('status', action.status)
    if (action.status === Status.REQUESTING) {
        return state.merge({
            fileName: action.file.name,
            mimeType: action.file.type,
            progress: action.progress
        })
    } else if (action.status === Status.REQUESTING) {
        return state.merge({
            progress: 1
        })
    }
    return state;
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
    }
    return state
}