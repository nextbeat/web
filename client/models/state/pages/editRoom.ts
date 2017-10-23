import { List, Map } from 'immutable'
import assign from 'lodash-es/assign'

import Stack from '@models/entities/stack'
import MediaItem from '@models/entities/mediaItem'
import CurrentUser from '@models/state/currentUser'
import { StateModelFactory } from '@models/state/base'
import { withEntityMap, EntityProps, createSelector } from '@models/utils'
import { UploadType } from '@actions/types'
import { State } from '@types'

export interface RoomFields {
    description: string
    privacy_status: string
    tags?: List<string>
}
interface EditRoomProps extends EntityProps {
    roomFields: Map<keyof RoomFields, any>
    roomChanged: boolean

    useDefaultThumbnail: boolean
    fetchingDefaultThumbnail: boolean
    latestMediaItemId: number
    
    isSubmittingFields: boolean
    hasSubmittedFields: boolean
    submitFieldsError: string
    isSubmittingTags: boolean
    hasSubmittedTags: boolean
    submitTagsError: string
    isSubmittingThumbnail: boolean
    hasSubmittedThumbnail: boolean
    submitThumbnailError: string
}

const keyMap = withEntityMap({
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
})

const keyMapPrefix = ['pages', 'editRoom']

export default class EditRoom extends StateModelFactory<EditRoomProps>(keyMap, keyMapPrefix) {

    static entity(state: State) {
        return new Stack(this.get(state, 'id'), state.get('entities'))
    }

    static isLoaded(state: State) {
        return this.get(state, 'id') > 0
    }

    static isAuthorized(state: State) {
        return this.isLoaded(state) && this.entity(state).get('author') === CurrentUser.get(state, 'id')
    }

    static latestMediaItem = createSelector(
        (state: State) => new MediaItem(EditRoom.get(state, 'latestMediaItemId'), state.get('entities'))
    )(
        (state: State) => state.getIn(['entities', 'mediaItems', EditRoom.get(state, 'latestMediaItemId').toString()])
    )

    static thumbnail(state: State) {
        // todo: if select default, load latest media item
        return !!this.get(state, 'useDefaultThumbnail') ? this.latestMediaItem(state).thumbnail('small') : this.entity(state).thumbnail('small')
    }

    isProcessingThumbnail() {
        // return true if uploading custom thumbnail or fetching default
        let upload = new Upload(this.state)
        return this.get('fetchingDefaultThumbnail') || upload.isUploading(UploadType.THUMBNAIL)
    }

    static canSubmit(state: State) {
        return !!this.get(state, 'roomChanged') && this.get(state, 'roomFields').get('description').length > 0
    }

    static isSubmitting(state: State) {
        return this.get(state, 'isSubmittingThumbnail') || this.get(state, 'isSubmittingTags') || this.get(state, 'isSubmittingFields')
    }

    static hasSubmitted(state: State) {
        return !this.get(state, 'isSubmittingThumbnail') && this.get(state, 'hasSubmittedTags') && this.get(state, 'hasSubmittedFields')
    }

    static submitError(state: State) {
        return this.get(state, 'submitThumbnailError') || this.get(state, 'submitTagsError') || this.get(state, 'submitFieldsError')
    }

    static stackForSubmission(state: State) {
        if (!this.isLoaded(state)) {
            return null
        }

        return assign({}, this.get(state, 'roomFields').toJS(), { uuid: this.entity(state).get('uuid') })
    }

}