import * as React from 'react'
import { connect } from 'react-redux'

import Spinner from '@components/shared/Spinner'
import FileComponent, { FileComponentProps } from '@components/utils/FileComponent'
import Upload, { UploadType } from '@models/state/upload'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    file: File

    isCustom: boolean    
    isUploadingCustom: boolean
    isDoneUploadingCustom: boolean
    customThumbnailUrl: string

    isDoneProcessing: boolean    
    processedImageUrl: string
}

type Props = ConnectProps & DispatchProps & FileComponentProps

class CreateRoomThumbnail extends React.Component<Props> {

    constructor(props: Props) {
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
        const { processedImageUrl, isDoneProcessing } = this.props

        if (isDoneProcessing) {
            return <div className="upload_create-room_thumb-custom-img" style={{ backgroundImage: `url(${processedImageUrl})`}}></div>
        } else {
            return <Spinner styles={["grey"]} />
        }
    }

    renderDefaultThumbnail() {
        const { resourceType } = this.props 
        return resourceType === 'incompatible' ? this.renderDefaultIncompatibleThumbnail() : this.renderDefaultCompatibleThumbnail();
    }

    renderCustomThumbnail() {
        const { isUploadingCustom, isDoneUploadingCustom, customThumbnailUrl } = this.props 

        if (isUploadingCustom) {
            return <Spinner styles={["grey"]} />
        } else if (isDoneUploadingCustom) {
            return <div 
                        className="upload_create-room_thumb-custom-img"
                        style={{ backgroundImage: `url(${customThumbnailUrl})` }}
                    ></div>
        }
        return null;
    }

    render() {
        const { isCustom } = this.props

        return (
            <div className="upload_create-room_thumb-inner" id="upload_create-room_thumb-inner">
                { isCustom ? this.renderCustomThumbnail() : this.renderDefaultThumbnail() }
            </div>
        )
    }
}

const fileOptions = {

    onImageLoad: function(src: string) {
        let imageElement = document.getElementById('upload_create-room_thumb-image') as HTMLImageElement
        imageElement.src = src
    },

    onVideoLoad: function(src: string) {
        let videoElement = document.getElementById('upload_create-room_thumb-video') as HTMLVideoElement
        videoElement.src = src
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        file: Upload.getInFile(state, UploadType.MediaItem, 'file'),
        isCustom: Upload.hasFile(state, UploadType.Thumbnail),
        isUploadingCustom: Upload.isUploading(state, UploadType.Thumbnail),
        isDoneUploadingCustom: Upload.isDoneUploading(state, UploadType.Thumbnail),
        customThumbnailUrl: Upload.getInFile(state, UploadType.Thumbnail, 'url'),
        isDoneProcessing: Upload.isDoneProcessing(state, UploadType.MediaItem),
        processedImageUrl: Upload.processedImageUrl(state) || ''
    }
}

export default connect(mapStateToProps)(FileComponent('upload_create-room_thumb-inner', fileOptions)(CreateRoomThumbnail));
