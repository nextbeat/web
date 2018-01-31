import { fromJS, Map } from 'immutable'
import assign from 'lodash-es/assign'

import { StateModelFactory } from '@models/state/base'
import { createSelector } from '@models/utils'
import CurrentUser from '@models/state/currentUser'
import Room from '@models/state/room'
import Comment from '@models/entities/comment'
import Stack from '@models/entities/stack'
import { generateUuid } from '@utils'
import { Status } from '@actions/types'
import { State } from '@types'
import { UploadType, UploadFileType, isBrowserCompatible, fileType } from '@upload'

export { UploadType }

interface UploadSubmissionProps {
    selectedStackId: number
    newStack: any
    mediaItem: any
    submitStackRequested: boolean
    isSubmittingStack: boolean
    stackSubmitted: boolean
    submitStackError: string

    referencedCommentId: number
    referencedCommentIsFetching: boolean
    referencedCommentHasFetched: boolean
    referencedCommentError: string
}

interface UploadFileProps {
    file: File
    uploadProgress: number
    uploadComplete: boolean
    status: Status
    error: string
    url: string
    xhr: XMLHttpRequest

    processingProgress: number
    processingTimeLeft: number
    processingComplete: number
}

const submissionKeyMap = {
    'selectedStackId': ['selectedStackId'],
    'newStack': ['newStack'],
    'mediaItem': ['mediaItem'],
    'submitStackRequested': ['submitStackRequested'],
    'isSubmittingStack': ['isSubmittingStack'],
    'stackSubmitted': ['stackSubmitted'],
    'submitStackError': ['submitStackError'],
    // Uploading response fields
    'referencedCommentId': ['referencedComment', 'id'],
    'referencedCommentIsFetching': ['referencedComment', 'isFetching'],
    'referencedCommentHasFetched': ['referencedComment', 'hasFetched'],
    'referencedCommentError': ['referencedComment', 'error']
}

const submissionKeyMapPrefix = ['upload', 'submission']

interface StackSubmissionObject {
    description: string
    tags: string[]
    privacy_status: string
    uuid: string
    media_items: Partial<MediaItemSubmissionObject>[]
    thumbnails: { url: string }[]
}

interface MediaItemSubmissionObject {
    type: string
    uuid: string
    stack_uuid: string
    title: string
    images: any[]
    videos: any[]
    references: number
}

/**************
 * UPLOAD CLASS
 **************/

export default class Upload extends StateModelFactory<UploadSubmissionProps>(submissionKeyMap, submissionKeyMapPrefix) {

    static fileState(state: State, type=UploadType.MediaItem): Map<keyof UploadFileProps, any> {
        return state.getIn(['upload', 'uploads', type], Map())
    }

    /*********
     * QUERIES
     *********/

    static isUploading(state: State, type: UploadType) {
        return this.getInFile(state, type, 'status') === Status.REQUESTING
    }

    static isDoneUploading(state: State, type: UploadType) {
        return !!this.getInFile(state, type, 'uploadComplete')
    }

    static isDoneProcessing(state: State, type: UploadType) {
        return !!this.getInFile(state, type, 'processingComplete')
    }

    static hasFile(state: State, type: UploadType) {
        return this.fileState(state, type).has('file')
    }

    static isBrowserCompatible(state: State, uploadType: UploadType) {
        let file = this.getInFile(state, uploadType, 'file')

        if (!file) {
            return false
        }

        return isBrowserCompatible(file)
    }

    /*********
     * GETTERS
     *********/

    static getInFile<K extends keyof UploadFileProps>(state: State, type: UploadType, key: K, defaultValue?: UploadFileProps): UploadFileProps[K] {
        return this.fileState(state, type).get(key, defaultValue)
    }

    static stage(state: State, type: UploadType): 'process' | 'upload' {
        if (this.getInFile(state, type, 'uploadComplete')) {
            return 'process'
        } else {
            return 'upload'
        }
    }

    static fileType(state: State, uploadType: UploadType): UploadFileType | null {
        // 'image' or 'video'
        let file = this.getInFile(state, uploadType, 'file')
        if (!file) {
            return null
        }

        return fileType(file)
    }

    static processedImageUrl(state: State): string | null {
        if (!this.isDoneProcessing(state, UploadType.MediaItem)) {
            return null;
        }

        let processedItem = this.get(state, 'mediaItem').get('processedItem')
        let attr = processedItem.get('item_type') === 'video' ? 'poster_url' : 'url'
        return processedItem.get(attr)
    }


    /**********************
     * REFERENCING COMMENTS
     **********************/

    static referencedCommentIsLoaded(state: State) {
        return !!this.get(state, 'referencedCommentHasFetched')
    }

    static referencedComment = createSelector(
        (state: State) => new Comment(Upload.get(state, 'referencedCommentId'), state.get('entities'))
    )(
        (state: State) => state.getIn(['entities', 'comments', `${Upload.get(state, 'referencedCommentId')}`])
    )

    static checkReferencedCommentValidity(state: State, hid: string) {
        // Throws an error if the comment is invalid,
        // which is displayed on the upload response page
        const roomId = Room.idForHid(state, hid)
        const comment = this.referencedComment(state);

        if (this.get(state, 'referencedCommentError') || !comment) {
            throw new Error("Chat message not found.");
        }
        if (!(comment.get('type') === 'message' && comment.get('subtype') === 'public')) {
            throw new Error("Chat message not found.")
        }
        if (roomId && comment.get('stack_id') !== roomId) {
            throw new Error("Chat message not found.")
        }
        if (roomId && Room.entity(state, roomId).get('closed')) {
            throw new Error("Room is closed.")
        }
        if (roomId && CurrentUser.get(state, 'id') !== Room.entity(state, roomId).get('author')) {
            throw new Error("User does not have permission to upload.");
        }
        if (!!comment.get('is_referenced_by')) {
            throw new Error("Chat message already has response.")
        }
    }


    /************
     * SUBMISSION
     ************/

    static hasSelectedNewStack(state: State) {
        return this.get(state, 'selectedStackId') === -1
    }

    static isSubmittable(state: State) {
        return this.get(state, 'selectedStackId') > 0 || (this.hasSelectedNewStack(state) && this.get(state, 'newStack', Map()).get('title', '').length > 0) 
    }

    static isInSubmitProcess(state: State): boolean {
        return !!this.get(state, 'submitStackRequested') || !!this.get(state, 'isSubmittingStack') || !!this.get(state, 'stackSubmitted') || !!this.get(state, 'submitStackError')
    }

    static selectedStack = createSelector(
        (state: State) => new Stack(Upload.get(state, 'selectedStackId'), state.get('entities'))
    )(
        (state: State) => state.getIn(['entities', 'stacks', Upload.get(state, 'selectedStackId', 0).toString()])
    )

    // Constructs a JSON object to send to the server for syncing
    // with the stack and media item selected by the user
    static stackForSubmission(state: State): Partial<StackSubmissionObject> {

        // Format stack object
        let stack: Partial<StackSubmissionObject> = {}

        if (this.hasSelectedNewStack(state)) {
            assign(stack, {
                description: this.get(state, 'newStack').get('title'),
                tags: this.get(state, 'newStack').get('tags').toJS(),
                privacy_status: this.get(state, 'newStack').get('privacyStatus'),
                uuid: this.get(state, 'newStack').get('uuid')
            })
        } else {
            stack['uuid'] = this.selectedStack(state).get('uuid')
        }

        // Format media item object
        
        const mediaItemState = this.get(state, 'mediaItem').toJS()
        let mediaItem: Partial<MediaItemSubmissionObject> = {
            type: mediaItemState.type,
            uuid: mediaItemState.uuid,
            stack_uuid: stack.uuid
        }

        if (mediaItem.type === 'photo') {
            mediaItem.images = [{
                original_id: mediaItemState.resource_id
            }]
        } else if (mediaItem.type === 'video') {
            mediaItem.videos = [{
                original_id: mediaItemState.resource_id
            }]
        }

        if (mediaItemState.title && mediaItemState.title.trim().length > 0) {
            mediaItem.title = mediaItemState.title.trim()
        }

        if (this.referencedCommentIsLoaded(state)) {
            mediaItem.references = this.get(state, 'referencedCommentId')
        }

        stack.media_items = [mediaItem]

        // Format thumbnail object
        // TODO: include dimensions

        if (this.hasFile(state, UploadType.Thumbnail)) {
            stack.thumbnails = [{
                url: this.getInFile(state, UploadType.Thumbnail, 'url')
            }]
        }

        return stack
    }

}