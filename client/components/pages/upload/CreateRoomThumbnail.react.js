import React from 'react'

import Spinner from '../../shared/Spinner.react'
import FileComponent from './utils/FileComponent.react'
import { UploadTypes } from '../../../actions'

class CreateRoomThumbnail extends React.Component {

    constructor(props) {
        super(props)

        this.renderDefaultCompatibleThumbnail = this.renderDefaultCompatibleThumbnail.bind(this)
        this.renderDefaultIncompatibleThumbnail = this.renderDefaultIncompatibleThumbnail.bind(this)
        this.renderDefaultThumbnail = this.renderDefaultThumbnail.bind(this)
        this.renderCustomThumbnail = this.renderCustomThumbnail.bind(this)
    }

    renderDefaultCompatibleThumbnail() {
        const { width, height, offsetX, offsetY, resourceLoaded, resourceType } = this.props
        return (
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
        )
    }

    renderDefaultIncompatibleThumbnail() {
        const { upload } = this.props
        var url = upload.processedImageUrl()

        if (upload.isDoneProcessing()) {
            return <div className="upload_create-room_thumb-custom-img" style={{ backgroundImage: `url(${url})`}}></div>
        } else {
            return <Spinner type="grey" />
        }
    }

    renderDefaultThumbnail() {
        const { resourceType } = this.props 
        return resourceType === 'incompatible' ? this.renderDefaultIncompatibleThumbnail() : this.renderDefaultCompatibleThumbnail();
    }

    renderCustomThumbnail() {
        const { upload } = this.props 

        if (upload.isUploading(UploadTypes.THUMBNAIL)) {
            return <Spinner type="grey" />
        } else if (upload.isDoneUploading(UploadTypes.THUMBNAIL)) {
            return <div 
                        className="upload_create-room_thumb-custom-img"
                        style={{ backgroundImage: `url(${upload.get(UploadTypes.THUMBNAIL, 'url')})` }}
                    ></div>
        }
        return null;
    }

    render() {
        const { upload } = this.props
        const isCustom = upload.hasFile(UploadTypes.THUMBNAIL)

        return (
            <div className="upload_create-room_thumb-inner" id="upload_create-room_thumb-inner">
                { isCustom ? this.renderCustomThumbnail() : this.renderDefaultThumbnail() }
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
