import { State } from '@types'

export enum UploadType {
    MediaItem = 'MEDIA_ITEM',
    Thumbnail = 'THUMBNAIL',
    ProfilePicture = 'PROFILE_PICTURE',
    CoverImage = 'COVER_IMAGE',
    ShopProduct = 'SHOP_PRODUCT'
}

export type UploadFileType = 'image' | 'video' 

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

function fileExtension(fileName: string): string {
    return fileName.split('.').slice(-1)[0].toLowerCase()
}

export function fileTypeForMimeType(mimeType: string) {
    // 'image' or 'video'
    if (/^image\//.test(mimeType)) {
        return 'image'
    } else if (/^video\//.test(mimeType)) {
        return 'video'
    }
    return null
}

export function fileTypeForFileName(name: string) {
    let ext = fileExtension(name)
    if (COMPATIBLE_IMAGE_FORMATS.indexOf(ext) !== -1) {
        return 'image'
    } else if (COMPATIBLE_VIDEO_FORMATS.indexOf(ext) !== -1) {
        return 'video'
    }
    return null
}

export function fileType(file: File) {
    return fileTypeForMimeType(file.type) || fileTypeForFileName(file.name)
}

export function bucketUrl() {
    if (process.env.NODE_ENV === 'production') {
        return 'https://s3.amazonaws.com/nextbeat.media/'
    } else {
        return 'https://s3.amazonaws.com/nextbeat.dev.media/'
    }
}

export function cloudfrontUrl() {
    if (process.env.NODE_ENV === 'production') {
        return 'https://media.nextbeat.co/'
    } else {
        return 'https://media.dev.nextbeat.co/'
    }
}

export function isBrowserCompatible(file: File) {
    return BROWSER_COMPATIBLE_FORMATS.indexOf(fileExtension(file.name)) > -1
}

export function checkFileCompatibility(type: UploadType, file: File) {
    const ext = fileExtension(file.name)
    const fType = fileType(file)

    if (type === UploadType.MediaItem) {
        // Uploading media item resource
        if (!fType || COMPATIBLE_FILE_FORMATS.indexOf(ext) < 0) {
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