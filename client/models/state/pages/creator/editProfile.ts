import { List, Map } from 'immutable'

import { StateModelFactory } from '@models/state/base'
import Upload, { UploadType } from '@models/state/upload'
import CurrentUser from '@models/state/currentUser'
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

    'isUpdatingUser': ['submission', 'isUpdatingUser'],
    'hasUpdatedUser': ['submission', 'hasUpdatedUser'],
    'updateUserError': ['submission', 'updateUserError']
}

const keyMapPrefix = ['pages', 'creator', 'editProfile']

interface UserSubmitObject {
    full_name: string
    description: string
    website_url: string
    uuid: string

    profile_picture?: { url: string }
    cover_image?: { url: string }
}

export default class EditProfile extends StateModelFactory<EditProfileProps>(keyMap, keyMapPrefix) {

    static userSubmitObject(state: State) {

        let submitObject: any = {
            full_name: this.get(state, 'fields').get('fullName'),
            description: this.get(state, 'fields').get('bio'),
            website_url: this.get(state, 'fields').get('website'),
            uuid: CurrentUser.entity(state).get('uuid')
        }

        // add profile picture if it's been updated
        if (Upload.isDoneUploading(state, UploadType.ProfilePicture)) {
            submitObject['profile_picture'] = {
                url: Upload.getInFile(state, UploadType.ProfilePicture, 'url')
            }
        }

        // add cover image under similar conditions
        if (Upload.isDoneUploading(state, UploadType.CoverImage)) {
            submitObject['cover_image'] = {
                url: Upload.getInFile(state, UploadType.CoverImage, 'url')
            }
        }

        return submitObject
    }

}