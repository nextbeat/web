import React from 'react'
import { connect } from 'react-redux' 
import assign from 'lodash/assign'

import FileComponent from './utils/FileComponent.react'
import AddCaption from './AddCaption.react'
import Icon from '../../shared/Icon.react'
import Spinner from '../../shared/Spinner.react'
import { uploadMediaItemFile, updateNewMediaItem, promptModal, UploadTypes } from '../../../actions'

class FileSelect extends React.Component {

    constructor(props) {
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

    handleDragEvent(e) {
        e.preventDefault()
        e.stopPropagation()
    }

    handleDragEnter(e) {
        this.handleDragEvent(e)
        this.setState({
            isDragging: true
        })
    }

    handleDragLeave(e) {
        this.handleDragEvent(e)
        this.setState({
            isDragging: false
        })
    }

    handleDrop(e) {
        this.handleDragLeave(e)
        if (e.nativeEvent.dataTransfer.files.length > 0) {
            const file = e.nativeEvent.dataTransfer.files[0]
            this.props.dispatch(uploadMediaItemFile(file))
        }
    }


    // Other events

    handleClick(e) {
        $('#file-input').click()
    }

    handleInputChange(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0]
            this.props.dispatch(uploadMediaItemFile(file))
        }
    }

    handleAddCaptionClick() {
        this.props.dispatch(promptModal('add-caption'))
    }


    // Render

    renderIncompatibleFile() {
        const { upload } = this.props

        var url = upload.processedImageUrl()

        if (upload.isDoneProcessing()) {
            return <div className="upload_file-select_processed-image" style={{ backgroundImage: `url(${url})`}}></div>
        } else {
            return <div className="upload_file-select_processing"><Spinner type="large grey" /></div>
        }
    }

    renderCompatibleFile() {
        const { resourceLoaded, upload, width, height, offsetY, offsetX } = this.props

        const isImage = upload.fileType() === 'image'
        const isVideo = upload.fileType() === 'video'

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
        const { isDragging } = this.state
        const { upload, app } = this.props

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
                { !app.isMobile() && <div className="upload_drag-label">Or drag it here.</div> }
            </div>
        );
    }

    renderUploadProgress() {
        const { upload, app, resourceType, resourceWidth, resourceHeight } = this.props 

        const fileIsCompatible = resourceType !== 'incompatible'
        const hasDecoration = upload.get('mediaItem').getIn(['decoration', 'caption_text'], '').length > 0

        const shouldDisplayPrompt = !upload.isInSubmitProcess() && (fileIsCompatible || upload.isDoneProcessing())

        return (
            <div className="upload_file-select" id="upload_file-select">
                <AddCaption app={app} upload={upload} width={resourceWidth} height={resourceHeight} />
                { fileIsCompatible ? this.renderCompatibleFile() : this.renderIncompatibleFile() }
                { shouldDisplayPrompt && 
                    <div className="upload_caption-btn" onClick={this.handleAddCaptionClick}>{hasDecoration ? 'Edit' : 'Add'} Caption</div>
                }
            </div>
        );
    }

    render() {
        const { upload, app } = this.props 
        return upload.hasFile() ? this.renderUploadProgress() : this.renderUploadPrompt()
    }
}

const fileOptions = {

    onImageLoad: function(src) {
        const { dispatch, resourceWidth, resourceHeight } = this.props

        document.getElementById('upload_file-select_image').src = src

        // update image data for the media item to be submitted
        dispatch(updateNewMediaItem({
            width: resourceWidth,
            height: resourceHeight
        }))
    },

    onVideoLoad: function(src, video) {
        const { dispatch, resourceWidth, resourceHeight, resourceDuration, upload } = this.props  

        document.getElementById('upload_file-select_video').src = src

        dispatch(updateNewMediaItem({
            width: resourceWidth,
            height: resourceHeight,
            duration: resourceDuration,
        }))
    }
}

export default connect()(FileComponent('upload_file-select', fileOptions)(FileSelect));
