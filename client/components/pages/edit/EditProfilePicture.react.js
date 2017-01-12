import React from 'react'
import { connect } from 'react-redux'

import Icon from '../../shared/Icon.react'
import Spinner from '../../shared/Spinner.react'
import { Upload, CurrentUser } from '../../../models'
import { promptModal, UploadTypes } from '../../../actions'

class EditProfilePicture extends React.Component {
    
    constructor(props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        this.props.dispatch(promptModal('edit-profile-picture'))
    }

    render() {
        const { currentUser, upload } = this.props 

        let profpicUrl = upload.get(UploadTypes.PROFILE_PICTURE, 'url') || currentUser.profileThumbnailUrl()
        let profpicStyle = {
            backgroundImage: !upload.isUploading(UploadTypes.PROFILE_PICTURE) ? `url(${profpicUrl})` : ''
        }

        return (
            <div className="edit-profile_profpic" onClick={this.handleClick} >
                <div className="edit-profile_profpic-inner" style={profpicStyle}>
                    { upload.isUploading(UploadTypes.PROFILE_PICTURE) &&  <Spinner type="grey small" /> }
                    { !upload.isUploading(UploadTypes.PROFILE_PICTURE) && !profpicUrl && <Icon type="person" /> }
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        currentUser: new CurrentUser(state),
        upload: new Upload(state)
    }
}

export default connect(mapStateToProps)(EditProfilePicture)