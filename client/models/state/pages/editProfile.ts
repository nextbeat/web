import { List, Map } from 'immutable'

import { StateModelFactory } from '@models/state/base'
import Upload from '@models/state/upload'
import CurrentUser from '@models/state/currentUser'
import { UploadType } from '@actions/types'
import { State } from '@types'

interface EditProfileProps {
    id: number
    fields: Map<string, any>
    hasChanged: boolean

    isUpdatingUser: boolean
    hasUpdatedUser: boolean
    updateUserError: string
}

const keyMap = {
    'id': ['meta', 'id'],
    'fields': ['fields'],
    'hasChanged': ['hasChanged'],
    // submission
    'isUpdatingUser': ['submission', 'isUpdatingUser'],
    'hasUpdatedUser': ['submission', 'hasUpdatedUser'],
    'updateUserError': ['submission', 'updateUserError']
}

const keyMapPrefix = ['pages', 'editProfile']

export default class EditProfile extends StateModelFactory<EditProfileProps>(keyMap, keyMapPrefix) {

    static userSubmitObject(state: State) {

        let submitObject = {
            full_name: this.get(state, 'fields').get('fullName'),
            description: this.get(state, 'fields').get('bio'),
            website_url: this.get(state, 'fields').get('website'),
            uuid: CurrentUser.entity(state).get('uuid')
        }

        // add profile picture if it's been updated
        if (upload.isDoneUploading(UploadType.PROFILE_PICTURE)) {
            submitObject['profile_picture'] = {
                url: upload.get(UploadType.PROFILE_PICTURE, 'url')
            }
        }

        // add cover image under similar conditions
        if (upload.isDoneUploading(UploadType.COVER_IMAGE)) {
            submitObject['cover_image'] = {
                url: upload.get(UploadType.COVER_IMAGE, 'url')
            }
        }

        return submitObject
    }

}