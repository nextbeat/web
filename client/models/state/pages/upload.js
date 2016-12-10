import { fromJS } from 'immutable'
import assign from 'lodash/assign'

import StateModel from '../base'
import App from '../app'
import { generateUuid } from '../../../utils'
import { Status } from '../../../actions'

const KEY_MAP = {
    // Media upload
    'file': ['file'],
    'status': ['status'],
    'progress': ['progress'],
    'xhr': ['xhr'], // reference to XHR object which handles upload to S3
    'error': ['error'],
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

const COMPATIBLE_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'video/mp4'
]

export default class Upload extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['pages', 'upload'];
    }


    // Queries

    isUploading() {
        return this.get('status') === Status.REQUESTING || this.get('isUploadingThumbnail')
    }

    hasFile() {
        return this.has('file')
    }

    hasSelectedNewStack() {
        return this.get('selectedStackId') === -1
    }

    isCompatible() {
        return this.constructor.isCompatibleMimeType(this.mimeType())
    }

    static isCompatibleMimeType(mimeType) {
        return COMPATIBLE_MIME_TYPES.indexOf(mimeType) !== -1
    }

    isSubmittable() {
        return this.get('selectedStackId') > 0 || (this.hasSelectedNewStack() && this.get('newStack').get('title').length > 0) 
    }

    isInSubmitProcess() {
        return this.get('submitStackRequested') || this.get('isSubmittingStack') || this.get('stackSubmitted') || this.get('submitStackError')
    }


    // Getters

    mimeType() {
        return this.get('file') ? this.get('file').type : null
    }

    fileType() {
        // 'image' or 'video'
        return this.constructor.fileTypeForMimeType(this.mimeType())
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
                url: mediaItemState.url,
                width: mediaItemState.width || 0,
                height: mediaItemState.height || 0
            }]
        } else if (mediaItem.type === 'video') {
            mediaItem.videos = [{
                url: mediaItemState.url,
                poster_url: mediaItemState.posterUrl,
                width: mediaItemState.width || 0,
                height: mediaItemState.height || 0,
                duration: mediaItemState.duration || 0
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