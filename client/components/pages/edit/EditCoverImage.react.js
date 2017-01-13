import React from 'react'
import { connect } from 'react-redux'

import Icon from '../../shared/Icon.react'
import Spinner from '../../shared/Spinner.react'
import { Upload, CurrentUser } from '../../../models'
import { promptModal, UploadTypes } from '../../../actions'

class EditCoverImage extends React.Component {
    
    constructor(props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        this.props.dispatch(promptModal('edit-cover-image'))
    }

    render() {
        const { currentUser, upload } = this.props 

        let coverUrl = upload.get(UploadTypes.COVER_IMAGE, 'url') || currentUser.coverImageUrl('small')
        if (coverUrl && !upload.isUploading(UploadTypes.COVER_IMAGE)) {
            var coverStyle = {
                background: `url(${coverUrl})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }
        }
        let promptText = coverUrl ? 'Edit cover photo' : 'Add cover photo'

        return (
            <div className="edit-profile_cover-image">
                <div className="edit-profile_cover-image_inner" onClick={this.handleClick} style={coverStyle}>
                    { upload.isUploading(UploadTypes.COVER_IMAGE) &&  <Spinner type="grey" /> }
                    <div className="edit-profile_cover-image_prompt">{ promptText }</div>
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

export default connect(mapStateToProps)(EditCoverImage)