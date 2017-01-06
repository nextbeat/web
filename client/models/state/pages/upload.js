import { fromJS, Map } from 'immutable'
import assign from 'lodash/assign'

import StateModel from '../base'
import App from '../app'
import { generateUuid } from '../../../utils'
import { Status } from '../../../actions'

function fileExtension(fileName) {
    return fileName.split('.').slice(-1)[0].toLowerCase()
}

const KEY_MAP = {
    // Media upload
    'file': ['file'],
    'status': ['status'],
    'uploadProgress': ['uploadProgress'],
    'xhr': ['xhr'], // reference to XHR object which handles upload to S3
    'error': ['error'],
    'stage': ['stage'],
    // Media upload processing
    'processingProgress': ['processingProgress'],
    'processingTimeLeft': ['processingTimeLeft'],
    'processingComplete': ['processingComplete'],
    // Thumbnail upload
    'hasCustomThumbnail': ['hasCustomThumbnail'],
    'isUploadingThumbnail': ['isUploadingThumbnail'],
    'hasUploadedThumbnail': ['hasUploadedThumbnail'],
    'uploadThumbnailError': ['uploadThumbnailError'],
    'thumbnailUrl': ['thumbnailUrl'],
    // Stack and media item submission
    'selectedStackId': ['selectedStackId'],
    'newStack': ['newStack'],
    'mediaItem': ['mediaItem'],
    'submitStackRequested': ['submitStackRequested'],
    'isSubmittingStack': ['isSubmittingStack'],
    'stackSubmitted': ['stackSubmitted'],
    'submitStackError': ['submitStackError']
}

const COMPATIBLE_IMAGE_FORMATS = [
    'jpeg',
    'jpg',
    'png',
    'gif',
    'tif',
    'tiff'
]

const COMPATIBLE_VIDEO_FORMATS = [
    'mp4',
    'm4v',
    'mkv',
    'mov',
    'mpeg4',
    'avi',
    'wmv',
    'flv',
    '3gp',
    '3g2',
    'webm'
]

const COMPATIBLE_FILE_FORMATS = COMPATIBLE_IMAGE_FORMATS.concat(COMPATIBLE_VIDEO_FORMATS)

export default class Upload extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['pages', 'upload'];
    }


    // Queries

    isUploading() {
        return this.get('stage') === 'upload' && this.get('status') === Status.REQUESTING
    }

    isDoneProcessing() {
        return !!this.get('processingComplete', false)
    }

    hasFile() {
        return this.has('file')
    }

    hasSelectedNewStack() {
        return this.get('selectedStackId') === -1
    }

    isCompatible() {
        return this.constructor.isCompatibleFile(this.fileName(), this.mimeType())
    }

    static isCompatibleFile(fileName, mimeType) {
        const ext = fileExtension(fileName)
        const fileType = this.fileTypeForMimeType(mimeType)

        return (!mimeType || ['image', 'video'].indexOf(fileType) !== -1) && COMPATIBLE_FILE_FORMATS.indexOf(ext) !== -1
    }

    isSubmittable() {
        return this.get('selectedStackId') > 0 || (this.hasSelectedNewStack() && this.get('newStack').get('title').length > 0) 
    }

    isInSubmitProcess() {
        return this.get('submitStackRequested') || this.get('isSubmittingStack') || this.get('stackSubmitted') || this.get('submitStackError')
    }


    // Getters

    fileName() {
        return this.get('file') ? this.get('file').name : null
    }

    mimeType() {
        return this.get('file') ? this.get('file').type : null
    }

    fileType() {
        // 'image' or 'video'
        return this.constructor.fileTypeForMimeType(this.mimeType()) || this.constructor.fileTypeForFileName(this.fileName())
    }

    static fileTypeForMimeType(mimeType) {
        // 'image' or 'video'
        if (/^image\//.test(mimeType)) {
            return 'image'
        } else if (/^video\//.test(mimeType)) {
            return 'video'
        }
        return null
    }

    static fileTypeForFileName(name) {
        let ext = fileExtension(name)
        if (COMPATIBLE_IMAGE_FORMATS.indexOf(ext) !== -1) {
            return 'image'
        } else if (COMPATIBLE_VIDEO_FORMATS.indexOf(ext) !== -1) {
            return 'video'
        }
        return null
    }

    bucketUrl() {
        return this.constructor.bucketUrl(this.state)
    }

    static bucketUrl(state) {
        var app = new App(state)
        if (app.get('environment') === 'production') {
            return 'https://s3.amazonaws.com/nextbeat.media/'
        } else {
            return 'https://s3.amazonaws.com/nextbeat.dev.media/'
        }
    }

    cloudfrontUrl() {
        return this.constructor.cloudfrontUrl(this.state)
    }

    static cloudfrontUrl(state) {
        var app = new App(state)
        if (app.get('environment') === 'production') {
            return 'https://media.nextbeat.co/'
        } else {
            return 'https://media.dev.nextbeat.co/'
        }
    }

    selectedStack() {
        if (this.get('selectedStackId') > 0) {
            return this.__getEntity(this.get('selectedStackId'), 'stacks')
        }
        return null;
    }


    // Submission

    // Constructs a JSON object to send to the server for syncing
    // with the stack and media item selected by the user
    stackForSubmission() {

        // Format stack object
        let stack = {}
        if (this.hasSelectedNewStack()) {
            assign(stack, {
                description: this.get('newStack').get('title'),
                tags: this.get('newStack').get('tags').toJS(),
                privacy_status: this.get('newStack').get('privacyStatus'),
                uuid: this.get('newStack').get('uuid')
            })
        } else {
            stack.uuid = this.selectedStack().get('uuid')
        }

        // Format media item object
        const mediaItemState = this.get('mediaItem').toJS()
        let mediaItem = {
            type: mediaItemState.type,
            uuid: mediaItemState.uuid,
            stack_uuid: stack.uuid
        }

        if (this.get('mediaItem').getIn(['decoration', 'caption_text'], '').length > 0) {
            mediaItem.decoration = mediaItemState.decoration
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

        stack.media_items = [mediaItem]

        // Format thumbnail object
        // TODO: include dimensions
        if (this.get('hasCustomThumbnail')) {
            stack.thumbnails = [{
                url: this.get('thumbnailUrl')
            }]
        }

        return stack
    }

}