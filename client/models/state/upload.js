import { fromJS, Map } from 'immutable'
import assign from 'lodash/assign'

import StateModel from './base'
import App from './app'
import { generateUuid } from '../../utils'
import { Status, UploadTypes } from '../../actions'

const KEY_MAP = {
    'selectedStackId': ['selectedStackId'],
    'newStack': ['newStack'],
    'mediaItem': ['mediaItem'],
    'submitStackRequested': ['submitStackRequested'],
    'isSubmittingStack': ['isSubmittingStack'],
    'stackSubmitted': ['stackSubmitted'],
    'submitStackError': ['submitStackError']
}

function fileExtension(fileName) {
    return fileName.split('.').slice(-1)[0].toLowerCase()
}

const BROWSER_COMPATIBLE_FORMATS = [
    'jpeg',
    'jpg',
    'png',
    'mp4',
    'm4v',
    'webm'
]

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
        // Note: Key map only used to access submission part of the state
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['upload', 'submission'];
    }

    fileState(type=UploadTypes.MEDIA_ITEM) {
        return this.state.getIn(['upload', 'uploads', type], Map())
    }

    /*********
     * QUERIES
     *********/

    isUploading(type) {
        return this.fileState(type).get('status') === Status.REQUESTING
    }

    isDoneUploading(type) {
        return !!(this.fileState(type).get('uploadComplete', false))
    }

    isDoneProcessing(type) {
        return !!(this.fileState(type).get('processingComplete', false))
    }

    hasFile(type) {
        return this.fileState(type).has('file')
    }

    static checkFileCompatibility(type, file) {
        const ext = fileExtension(file.name)
        const fileType = this.fileType(file)

        if (type === UploadTypes.MEDIA_ITEM) {
            // Uploading media item resource
            if (['image', 'video'].indexOf(fileType) < 0 || COMPATIBLE_FILE_FORMATS.indexOf(ext) < 0) {
                throw new Error('Incompatible file type. We currently accept most video and image formats.')
            }
            if (file.size > 500*1024*1024) {
                throw new Error('File exceeds size limit. Files cannot be greater than 500 MB.')
            }
        } else {
            // Uploading an image; should not exceed 3MB
            if (['jpg', 'jpeg', 'png', 'gif'].indexOf(ext) < 0) {
                throw new Error('Incompatible file type. We accept jpeg, png, and gif images.')
            }
            if (file.size > 3*1024*1024) {
                throw new Error('File exceeds size limit. Files cannot be greater than 3 MB.')
            }
        }

        return true;
    }

    isBrowserCompatible(uploadType) {
        let file = this.fileState(uploadType).get('file')

        if (!file) {
            return false
        }

        return this.constructor.isBrowserCompatible(file)
    }

    static isBrowserCompatible(file) {
        // for now, we are turning off all browser compatibility
        // checks, treating all files as though they were
        // incompatible (to ensure a more consistent user experience)
        return false;
    }


    /*********
     * GETTERS
     *********/

    get(...args) {
        if (Object.keys(UploadTypes).indexOf(args[0]) !== -1) {
            // overload super
            return this.fileState(args[0]).get(...args.slice(1))
        } else {
            return super.get(...args)
        }
    }

    stage(type) {
        if (this.fileState(type).get('uploadComplete')) {
            return 'process'
        } else {
            return 'upload'
        }
    }

    fileType(uploadType) {
        // 'image' or 'video'
        let file = this.fileState(uploadType).get('file')
        if (!file) {
            return null
        }

        return this.constructor.fileType(file)
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

    static fileType(file) {
        return this.fileTypeForMimeType(file.type) || this.fileTypeForFileName(file.name)
    }

    static bucketUrl(state) {
        var app = new App(state)
        if (app.get('environment') === 'production') {
            return 'https://s3.amazonaws.com/nextbeat.media/'
        } else {
            return 'https://s3.amazonaws.com/nextbeat.dev.media/'
        }
    }

    static cloudfrontUrl(state) {
        var app = new App(state)
        if (app.get('environment') === 'production') {
            return 'https://media.nextbeat.co/'
        } else {
            return 'https://media.dev.nextbeat.co/'
        }
    }

    processedImageUrl() {
        if (!this.isDoneProcessing()) {
            return null;
        }

        let processedItem = this.get('mediaItem').get('processedItem')
        let attr = processedItem.get('item_type') === 'video' ? 'poster_url' : 'url'
        return processedItem.get(attr)
    }


    /************
     * SUBMISSION
     ************/

    hasSelectedNewStack() {
        return this.get('selectedStackId') === -1
    }

    isSubmittable() {
        return this.get('selectedStackId') > 0 || (this.hasSelectedNewStack() && this.get('newStack', Map()).get('title', '').length > 0) 
    }

    isInSubmitProcess() {
        return this.get('submitStackRequested') || this.get('isSubmittingStack') || this.get('stackSubmitted') || this.get('submitStackError')
    }

    selectedStack() {
        if (this.get('selectedStackId') > 0) {
            return this.__getEntity(this.get('selectedStackId'), 'stacks')
        }
        return null;
    }

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

        if (this.hasFile(UploadTypes.THUMBNAIL)) {
            stack.thumbnails = [{
                url: this.get(UploadTypes.THUMBNAIL, 'url')
            }]
        }

        return stack
    }

}