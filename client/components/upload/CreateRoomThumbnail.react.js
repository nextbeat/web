import React from 'react'

import Spinner from '../shared/Spinner.react'
import FileComponent from './utils/FileComponent.react'

class CreateRoomThumbnail extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { upload, width, height, offsetX, offsetY, resourceLoaded } = this.props

        const isCustom = upload.get('hasCustomThumbnail')
        const isDefaultImage = upload.fileType() === 'image'
        const isDefaultVideo = upload.fileType() === 'video'

        return (
            <div className="upload_create-room_thumb-inner" id="upload_create-room_thumb-inner">
                { !isCustom && 
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <img id="upload_create-room_thumb-image" 
                            style={{
                                display: `${resourceLoaded && isDefaultImage ? 'block' : 'none'}`,
                                position: 'absolute', 
                                width: `${width}px`,
                                height: `${height}px`,
                                top: `${offsetY}px`,
                                left: `${offsetX}px`
                            }}
                        />
                        <video id="upload_create-room_thumb-video"
                            style={{
                                display: `${resourceLoaded && isDefaultVideo ? 'block' : 'none'}`,
                                position: 'absolute', 
                                width: `${width}px`,
                                height: `${height}px`,
                                top: `${offsetY}px`,
                                left: `${offsetX}px`
                            }}
                        />
                    </div>
                }
                { isCustom && upload.get('isUploadingThumbnail') &&
                    <Spinner type="grey" />
                }
                { isCustom && upload.get('hasUploadedThumbnail') &&
                    <div 
                        className="upload_create-room_thumb-custom-img"
                        style={{ backgroundImage: `url(${upload.get('thumbnailUrl')})` }}
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
