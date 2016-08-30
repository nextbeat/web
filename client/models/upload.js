import { fromJS } from 'immutable'

import ModelBase from './base'
import { Status } from '../actions'

const KEY_MAP = {
    'fileName': ['upload', 'fileName'],
    'mimeType': ['upload', 'mimeType'],
    'status': ['upload', 'status'],
    'progress': ['upload', 'progress'],
    'selectedStackId': ['upload', 'selectedStackId'],
    'newStack': ['upload', 'newStack']
}

const COMPATIBLE_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'video/mp4'
]

export default class Upload extends ModelBase {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "upload";
    }

    // Queries

    isUploading() {
        return this.get('status') === Status.REQUESTING
    }

    hasFile() {
        return this.has('fileName')
    }

    hasSelectedNewStack() {
        return this.get('selectedStackId') === -1
    }

    isCompatible() {
        return this.constructor.isCompatibleMimeType(this.get('mimeType'))
    }

    static isCompatibleMimeType(mimeType) {
        return COMPATIBLE_MIME_TYPES.indexOf(mimeType) !== -1
    }

    isSubmittable() {
        return this.get('selectedStackId') > 0 || (this.hasSelectedNewStack() && this.get('newStack').get('title').length > 0)
    }

    // Getters

    mediaItem() {
        let mediaItem = {
            type: this.fileType() === 'video' ? 'video' : 'photo'
        }

        // TODO

        return fromJS(mediaItem)
    }

    stackForSubmission() {
        // TODO
        return {}
    }

    fileType() {
        // 'image' or 'video'
        var mimeType = this.get('mimeType')
        if (/^image\//.test(mimeType)) {
            return 'image'
        } else if (/^video\//.test(mimeType)) {
            return 'video'
        }
        return null
    }

}