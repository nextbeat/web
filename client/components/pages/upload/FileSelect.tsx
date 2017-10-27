import * as React from 'react'
import { connect } from 'react-redux' 

import FileComponent, { FileComponentProps } from './utils/FileComponent'
import AddCaption from './AddCaption.react'
import Icon from '@components/shared/Icon'
import Spinner from '@components/shared/Spinner'
import { uploadMediaItemFile, updateNewMediaItem } from '@actions/upload'
import { promptModal } from '@actions/app'
import App from '@models/state/app'
import Upload, { UploadType } from '@models/state/upload'
import { State, DispatchProps } from '@types'

interface OwnProps {
    file: File 
}

interface ConnectProps {
    isMobile: boolean

    hasFile: boolean
    fileType: 'image' | 'video' | null
    mediaItem: State
    isInSubmitProcess: boolean
    isDoneProcessing: boolean
    processedImageUrl: string

}

type Props = OwnProps & ConnectProps & DispatchProps & FileComponentProps

interface FileSelectState {
    isDragging: boolean
}

class FileSelect extends React.Component<Props, FileSelectState> {

    constructor(props: Props) {
        super(props)

        this.handleDragEvent = this.handleDragEvent.bind(this)
        this.handleDragEnter = this.handleDragEnter.bind(this)
        this.handleDragLeave = this.handleDragLeave.bind(this)
        this.handleDrop = this.handleDrop.bind(this)

        this.handleClick = this.handleClick.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleAddCaptionClick = this.handleAddCaptionClick.bind(this)

        this.renderUploadPrompt = this.renderUploadPrompt.bind(this)
        this.renderUploadProgress = this.renderUploadProgress.bind(this)

        this.state = {
            isDragging: false
        }
    }


    // Drag events

    handleDragEvent(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault()
        e.stopPropagation()
    }

    handleDragEnter(e: React.MouseEvent<HTMLDivElement>) {
        this.handleDragEvent(e)
        this.setState({
            isDragging: true
        })
    }

    handleDragLeave(e: React.MouseEvent<HTMLDivElement>) {
        this.handleDragEvent(e)
        this.setState({
            isDragging: false
        })
    }

    handleDrop(e: React.MouseEvent<HTMLDivElement>) {
        this.handleDragLeave(e)
        let dataTransfer = (e.nativeEvent as any).dataTransfer
        if (dataTransfer.files.length > 0) {
            const file = dataTransfer.files[0]
            this.props.dispatch(uploadMediaItemFile(file))
        }
    }


    // Other events

    handleClick(e: React.MouseEvent<HTMLElement>) {
        $('#file-input').click()
    }

    handleInputChange(e: React.FormEvent<HTMLInputElement>) {
        if (e.currentTarget.files && e.currentTarget.files.length > 0) {
            const file = e.currentTarget.files[0]
            this.props.dispatch(uploadMediaItemFile(file))
        }
    }

    handleAddCaptionClick() {
        this.props.dispatch(promptModal('add-caption'))
    }


    // Render

    renderIncompatibleFile() {
        const { processedImageUrl, isDoneProcessing } = this.props

        if (isDoneProcessing) {
            return <div className="upload_file-select_processed-image" style={{ backgroundImage: `url(${processedImageUrl})`}}></div>
        } else {
            return <div className="upload_file-select_processing"><Spinner styles={["large", "grey"]} /></div>
        }
    }

    renderCompatibleFile() {
        const { resourceLoaded, fileType, width, height, offsetY, offsetX } = this.props

        const isImage = fileType === 'image'
        const isVideo = fileType === 'video'

        return [
            <img id="upload_file-select_image" 
                className="upload_file-select_image" 
                style={{ 
                    display: `${resourceLoaded && isImage ? 'block' : 'none'}`,
                    position: 'absolute', 
                    width: `${width}px`,
                    height: `${height}px`,
                    top: `${offsetY}px`,
                    left: `${offsetX}px`
                }}
            />,
            <video id="upload_file-select_video"
                className="upload_file-select_video"
                style={{
                    display: `${resourceLoaded && isVideo ? 'block' : 'none'}`,
                    position: 'absolute', 
                    width: `${width}px`,
                    height: `${height}px`,
                    top: `${offsetY}px`,
                    left: `${offsetX}px`
                }}
            />
        ]
    }

    renderUploadPrompt() {
        const { isMobile } = this.props
        const { isDragging } = this.state

        const dragEvents = {
            onDragEnter: this.handleDragEnter,
            onDragOver: this.handleDragEnter,
            onDragExit: this.handleDragLeave,
            onDragLeave: this.handleDragLeave,
            onDrop: this.handleDrop,
            onDragStart: this.handleDragEvent,
            onDragEnd: this.handleDragEvent,
            onDrag: this.handleDragEvent
        }

        const dragClass = isDragging ? 'dragging' : ''

        return (
            <div className={`upload_file-select ${dragClass}`} {...dragEvents} >
                <input type="file" id="file-input" className="upload_file-input" onChange={this.handleInputChange} />
                <Icon type="file-upload" />
                <div className="upload_select-label" onClick={this.handleClick}>Select file to upload.</div>
                { !isMobile && <div className="upload_drag-label">Or drag it here.</div> }
            </div>
        );
    }

    renderUploadProgress() {
        const { resourceType, resourceWidth, resourceHeight, mediaItem,
                isInSubmitProcess, isDoneProcessing } = this.props 

        const fileIsCompatible = resourceType !== 'incompatible'
        const hasDecoration = mediaItem.getIn(['decoration', 'caption_text'], '').length > 0

        const shouldDisplayPrompt = !isInSubmitProcess&& (fileIsCompatible || isDoneProcessing)

        return (
            <div className="upload_file-select" id="upload_file-select">
                <AddCaption  width={resourceWidth} height={resourceHeight} />
                { fileIsCompatible ? this.renderCompatibleFile() : this.renderIncompatibleFile() }
                { shouldDisplayPrompt && 
                    <div className="upload_caption-btn" onClick={this.handleAddCaptionClick}>{hasDecoration ? 'Edit' : 'Add'} Caption</div>
                }
            </div>
        );
    }

    render() {
        const { hasFile } = this.props 
        return hasFile ? this.renderUploadProgress() : this.renderUploadPrompt()
    }
}

const fileOptions = {

    onImageLoad: function(this: FileSelect, src: string) {
        const { dispatch, resourceWidth, resourceHeight } = this.props

        let imageElement = document.getElementById('upload_file-select_image') as HTMLImageElement
        imageElement.src = src

        // update image data for the media item to be submitted
        dispatch(updateNewMediaItem({
            width: resourceWidth,
            height: resourceHeight
        }))
    },

    onVideoLoad: function(this: FileSelect, src: string, video: HTMLVideoElement) {
        const { dispatch, resourceWidth, resourceHeight, resourceDuration } = this.props  

        let videoElement = document.getElementById('upload_file-select_video') as HTMLVideoElement
        videoElement.src = src

        dispatch(updateNewMediaItem({
            width: resourceWidth,
            height: resourceHeight,
            duration: resourceDuration,
        }))
    }
}

// isMobile: boolean

//     hasFile: boolean
//     fileType: 'image' | 'video' 
//     mediaItem: State
//     isInSubmitProcess: boolean
//     isDoneProcessing: boolean
//     processedImageUrl: string

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        isMobile: App.isMobile(state),
        hasFile: Upload.hasFile(state, UploadType.MediaItem),
        fileType: Upload.fileType(state, UploadType.MediaItem),
        mediaItem: Upload.get(state, 'mediaItem'),
        isInSubmitProcess: Upload.isInSubmitProcess(state),
        isDoneProcessing: Upload.isDoneProcessing(state, UploadType.MediaItem),
        processedImageUrl: Upload.processedImageUrl(state) || ''
    }
}

export default connect()(FileComponent('upload_file-select', fileOptions)(FileSelect));
