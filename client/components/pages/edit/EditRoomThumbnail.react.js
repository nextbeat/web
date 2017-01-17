import React from 'react'
import { connect } from 'react-redux'

import Icon from '../../shared/Icon.react'
import Spinner from '../../shared/Spinner.react'
import { Upload, EditRoom } from '../../../models'
import { promptModal, UploadTypes } from '../../../actions'

class EditRoomThumbnail extends React.Component {
    
    constructor(props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        this.props.dispatch(promptModal('edit-thumbnail'))
    }

    render() {
        const { editRoom, upload } = this.props 

        let thumbnailUrl = upload.get(UploadTypes.THUMBNAIL, 'url') || editRoom.thumbnail().get('url')
        let thumbnailStyle = {
            backgroundImage: !editRoom.isProcessingThumbnail() ? `url(${thumbnailUrl})` : ''
        }

        return (
            <div className="edit-room_thumbnail" onClick={this.handleClick} >
                <div className="edit-room_thumbnail-inner" style={thumbnailStyle}>
                    { editRoom.isProcessingThumbnail() && <Spinner type="grey small" /> }
                </div>
                <div className="edit-room_thumbnail-prompt">Edit thumbnail</div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        editRoom: new EditRoom(state),
        upload: new Upload(state)
    }
}

export default connect(mapStateToProps)(EditRoomThumbnail)