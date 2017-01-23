import { List, Map } from 'immutable'
import assign from 'lodash/assign'

import StackEntity from '../../entities/stack'
import MediaItemEntity from '../../entities/mediaItem'
import CurrentUser from '../currentUser'
import Upload from '../upload'
import StateModel from '../base'
import { UploadTypes } from '../../../actions'

const KEY_MAP = {
    // meta
    'id': ['meta', 'id'],
    'isFetching': ['meta', 'isFetching'],
    'error': ['meta', 'error'],
    // edited room
    'roomFields': ['roomFields'],
    'roomChanged': ['roomChanged'],
    // thumbnail 
    'useDefaultThumbnail': ['thumbnail', 'useDefault'],
    'fetchingDefaultThumbnail': ['thumbnail', 'fetchingDefault'],
    'latestMediaItemId': ['thumbnail', 'latestMediaItemId'],
    // submission
    'isSubmittingFields': ['submission', 'isSubmittingFields'],
    'hasSubmittedFields': ['submission', 'hasSubmittedFields'],
    'submitFieldsError': ['submission', 'submitFieldsError'],
    'isSubmittingTags': ['submission', 'isSubmittingTags'],
    'hasSubmittedTags': ['submission', 'hasSubmittedTags'],
    'submitTagsError': ['submission', 'submitTagsError'],
    'isSubmittingThumbnail': ['submission', 'isSubmittingThumbnail'],
    'hasSubmittedThumbnail': ['submission', 'hasSubmittedThumbnail'],
    'submitThumbnailError': ['submission', 'submitThumbnailError']
}

export default class EditRoom extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['pages', 'editRoom'];
    }

    entity() {
        return new StackEntity(this.get('id'), this.state.get('entities'))
    }

    isAuthorized() {
        let currentUser = new CurrentUser(this.state)
        return this.isLoaded() && this.entity().get('author_id') === currentUser.get('id')
    }

    latestMediaItem() {
        return new MediaItemEntity(this.get('latestMediaItemId'), this.state.get('entities'))
    }

    thumbnail() {
        // todo: if select default, load latest media item
        return this.get('useDefaultThumbnail') ? this.latestMediaItem().thumbnail('small') : this.entity().thumbnail('small')
    }

    isProcessingThumbnail() {
        // return true if uploading custom thumbnail or fetching default
        let upload = new Upload(this.state)
        return this.get('fetchingDefaultThumbnail') || upload.isUploading(UploadTypes.THUMBNAIL)
    }

    isSubmitting() {
        return this.get('isSubmittingThumbnail') || this.get('isSubmittingTags') || this.get('isSubmittingFields')
    }

    hasSubmitted() {
        return !this.get('isSubmittingThumbnail') && this.get('hasSubmittedTags') && this.get('hasSubmittedFields')
    }

    submitError() {
        return this.get('submitThumbnailError') || this.get('submitTagsError') || this.get('submitFieldsError')
    }

    stackForSubmission() {
        if (!this.isLoaded()) {
            return null
        }

        return assign({}, this.get('roomFields').toJS(), { uuid: this.entity().get('uuid') })
    }

}