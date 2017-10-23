import { 
    ActionType,
    UploadType,
    GenericAction, 
    ThunkAction,
    ApiCallAction,
    Status 
} from '@actions/types'
import * as Schemas from '@schemas'
import Comment from '@models/entities/comment'

// import { generateUuid } from '../utils'

export type UploadActionAll =
    UploadFileAction |
    InitiateProcessingStageAction |
    UpdateProcessingProgressAction |
    StopFileUploadAction |
    ClearFileUploadAction |
    SelectStackForUploadAction |
    UpdateNewStackAction |
    UpdateNewMediaItemAction |
    SubmitStackRequestAction |
    ReferencedCommentAction |
    ClearUploadAction

/********
 * UPLOAD
 ********/

interface UploadFileAction extends GenericAction {
    type: ActionType.UPLOAD_FILE
    uploadType: UploadType
    file: File
}

export function uploadMediaItemFile(file: File): UploadFileAction {
   return {
        type: ActionType.UPLOAD_FILE,
        uploadType: UploadType.MediaItem,
        file
    }
}

export function uploadThumbnail(file: File): UploadFileAction {
    return {
        type: ActionType.UPLOAD_FILE,
        uploadType: UploadType.Thumbnail,
        file
    }
}

export function uploadProfilePicture(file: File): UploadFileAction {
    return {
        type: ActionType.UPLOAD_FILE,
        uploadType: UploadType.ProfilePicture,
        file
    }
}

export function uploadCoverImage(file: File): UploadFileAction {
    return {
        type: ActionType.UPLOAD_FILE,
        uploadType: UploadType.CoverImage,
        file
    }
}

interface InitiateProcessingStageAction extends GenericAction {
    type: ActionType.INITIATE_PROCESSING_STAGE
    uploadType: UploadType
}
export function initiateProcessingStage(type: UploadType): InitiateProcessingStageAction {
    return {
        type: ActionType.INITIATE_PROCESSING_STAGE,
        uploadType: type
    }
}

interface ProcessingProgress {
    progress: number
    timeLeft: number
    completed: boolean
}
interface UpdateProcessingProgressAction extends GenericAction, ProcessingProgress {
    type: ActionType.UPDATE_PROCESSING_PROGRESS
    uploadType: UploadType
}
export function updateProcessingProgress(uploadType: UploadType, { progress, timeLeft, completed }: ProcessingProgress): UpdateProcessingProgressAction {
    return {
        type: ActionType.UPDATE_PROCESSING_PROGRESS,
        uploadType,
        progress,
        timeLeft,
        completed
    }
}

interface StopFileUploadAction extends GenericAction {
    type: ActionType.STOP_FILE_UPLOAD
    uploadType: UploadType
    error: Error
}
export function stopFileUpload(error: Error, type: UploadType): StopFileUploadAction {
    return {
        type: ActionType.STOP_FILE_UPLOAD,
        uploadType: type,
        error
    }
}

interface ClearFileUploadAction extends GenericAction {
    type: ActionType.CLEAR_FILE_UPLOAD
    uploadType: UploadType
}
export function clearFileUpload(type: UploadType): ClearFileUploadAction {
    return {
        type: ActionType.CLEAR_FILE_UPLOAD,
        uploadType: type
    }
}


/******************
 * STACK SUBMISSION
 ******************/

interface SelectStackForUploadAction extends GenericAction {
    type: ActionType.SELECT_STACK_FOR_UPLOAD
    id: number
    uuid?: string
}
export function selectStackForUpload(stackId: number): SelectStackForUploadAction {
    let uuid;
    if (stackId === -1) {
        // creating new stack, so generate uuid
        uuid = generateUuid()
    }
    return {
        type: ActionType.SELECT_STACK_FOR_UPLOAD,
        id: stackId,
        uuid
    }
}

interface UpdateNewStackAction extends GenericAction {
    type: ActionType.UPDATE_NEW_STACK
    stack: any
}
export function updateNewStack(stack: any): UpdateNewStackAction {
    return {
        type: ActionType.UPDATE_NEW_STACK,
        stack
    }
}

interface UpdateNewMediaItemAction extends GenericAction {
    type: ActionType.UPDATE_NEW_MEDIA_ITEM
    mediaItem: any
}
export function updateNewMediaItem(mediaItem: any): UpdateNewMediaItemAction {
    return {
        type: ActionType.UPDATE_NEW_MEDIA_ITEM,
        mediaItem
    }
}

interface SubmitStackRequestAction extends GenericAction {
    type: ActionType.SUBMIT_STACK_REQUEST
}
export function submitStackRequest(): SubmitStackRequestAction {
    return { 
        type: ActionType.SUBMIT_STACK_REQUEST
    }
}


/**********************
 * REFERENCING COMMENTS
 **********************/

interface ReferencedCommentAction extends ApiCallAction {
    type: ActionType.REFERENCED_COMMENT
    commentId: number
}
function fetchReferencedComment(commentId: number) {
    return {
        type: ActionType.REFERENCED_COMMENT,
        commentId,
        API_CALL: {
            schema: Schemas.Comment,
            endpoint: `comments/${commentId}`
        }
    }
}

export function loadReferencedComment(commentId: number): ThunkAction {
    return (dispatch, getState) => {
        const comment = new Comment(commentId, getState().get('entities'))
        if (!comment.isEmpty()) {
            // Comment is already loaded; 
            // call success block immediately
            var response = {
                result: commentId,
                entities: {
                    comments: { [commentId]: comment.toJS() },
                }
            }
            return dispatch({
                type: ActionType.REFERENCED_COMMENT,
                status: Status.SUCCESS,
                commentId,
                response
            })
        } else {
            return dispatch(fetchReferencedComment(commentId))
        }
    }
}

/*******
 * RESET
 *******/

interface ClearUploadAction extends GenericAction {
    type: ActionType.CLEAR_UPLOAD
}
export function clearUpload() {
    return {
        type: ActionType.CLEAR_UPLOAD
    }
}