import React from 'react'

import Spinner from '../../shared/Spinner.react'
import FileComponent from './utils/FileComponent.react'
import { UploadTypes } from '../../../actions'

class CreateRoomThumbnail extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { upload, width, height, offsetX, offsetY, resourceLoaded, resourceType } = this.props

        const isCustom = upload.hasFile(UploadTypes.THUMBNAIL)

        return (
            <div className="upload_create-room_thumb-inner" id="upload_create-room_thumb-inner">
                { !isCustom && 
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <img id="upload_create-room_thumb-image" 
                            style={{
                                display: `${resourceLoaded && resourceType === 'image' ? 'block' : 'none'}`,
                                position: 'absolute', 
                                width: `${width}px`,
                                height: `${height}px`,
                                top: `${offsetY}px`,
                                left: `${offsetX}px`
                            }}
                        />
                        <video id="upload_create-room_thumb-video"
                            style={{
                                display: `${resourceLoaded && resourceType === 'video' ? 'block' : 'none'}`,
                                position: 'absolute', 
                                width: `${width}px`,
                                height: `${height}px`,
                                top: `${offsetY}px`,
                                left: `${offsetX}px`
                            }}
                        />
                    </div>
                }
                { isCustom && upload.isUploading(UploadTypes.THUMBNAIL) &&
                    <Spinner type="grey" />
                }
                { isCustom && upload.isDoneUploading(UploadTypes.THUMBNAIL) &&
                    <div 
                        className="upload_create-room_thumb-custom-img"
                        style={{ backgroundImage: `url(${upload.get(UploadTypes.THUMBNAIL, 'url')})` }}
                    ></div>
                }
            </div>
        )
    }
}

const fileOptions = {

    onImageLoad: function(src) {
        document.getElementById('upload_create-room_thumb-image').src = src
    },

    onVideoLoad: function(src, video) {
        document.getElementById('upload_create-room_thumb-video').src = src
    }
}

export default FileComponent('upload_create-room_thumb-inner', fileOptions)(CreateRoomThumbnail);
