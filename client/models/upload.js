import ModelBase from './base'
import { Status } from '../actions'

const KEY_MAP = {
    'fileName': ['upload', 'fileName'],
    'mimeType': ['upload', 'mimeType'],
    'status': ['upload', 'status'],
    'progress': ['upload', 'progress']
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

    isUploading() {
        return this.get('status') === Status.REQUESTING
    }

    hasFile() {
        return this.has('fileName')
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

    isCompatible() {
        return this.constructor.isCompatibleMimeType(this.get('mimeType'))
    }

    static isCompatibleMimeType(mimeType) {
        return COMPATIBLE_MIME_TYPES.indexOf(mimeType) !== -1
    }

}