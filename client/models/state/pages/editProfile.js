import { List, Map } from 'immutable'

import StateModel from '../base'
import Upload from '../upload'
import CurrentUser from '../currentUser'
import { UploadTypes } from '../../../actions'

const KEY_MAP = {
    'id': ['meta', 'id'],
    'fields': ['fields'],
    'hasChanged': ['hasChanged'],
    // submission
    'isUpdatingUser': ['submission', 'isUpdatingUser'],
    'hasUpdatedUser': ['submission', 'hasUpdatedUser'],
    'updateUserError': ['submission', 'updateUserError']
}

export default class EditProfile extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['pages', 'editProfile'];
    }

    userSubmitObject() {
        let currentUser = new CurrentUser(this.state)
        let upload = new Upload(this.state)

        let submitObject = {
            full_name: this.get('fields').get('fullName'),
            description: this.get('fields').get('bio'),
            website_url: this.get('fields').get('website'),
            uuid: currentUser.get('uuid')
        }

        // add profile picture if it's been updated
        if (upload.isDoneUploading(UploadTypes.PROFILE_PICTURE)) {
            submitObject['profile_picture'] = {
                url: upload.get(UploadTypes.PROFILE_PICTURE, 'url')
            }
        }

        // add cover image under similar conditions
        if (upload.isDoneUploading(UploadTypes.COVER_IMAGE)) {
            submitObject['cover_image'] = {
                url: upload.get(UploadTypes.COVER_IMAGE, 'url')
            }
        }

        return submitObject
    }

}