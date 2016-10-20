import React from 'react'
import { connect } from 'react-redux' 
import { assign } from 'lodash'

import FileComponent from './utils/FileComponent.react'
import AddCaption from './AddCaption.react'
import Icon from '../shared/Icon.react'
import { uploadFile, uploadPosterFile, updateNewMediaItem, promptModal } from '../../actions'

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
            this.props.dispatch(uploadFile(file))
        }
    }


    // Other events

    handleClick(e) {
        $('#file-input').click()
    }

    handleInputChange(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0]
            this.props.dispatch(uploadFile(file))
        }
    }

    handleAddCaptionClick() {
        this.props.dispatch(promptModal('add-caption'))
    }


    // Render

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
        const { resourceLoaded, resourceWidth, resourceHeight, width, height, offsetX, offsetY } = this.props
        const { upload, app } = this.props 

        const isImage = upload.fileType() === 'image'
        const isVideo = upload.fileType() === 'video'
        const hasDecoration = upload.get('mediaItem').getIn(['decoration', 'caption_text'], '').length > 0

        return (
            <div className="upload_file-select" id="upload_file-select">
                <AddCaption app={app} upload={upload} width={resourceWidth} height={resourceHeight} />
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
                />
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
                { !upload.isInSubmitProcess() && 
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

        // update image data for the media item to be submitted
        dispatch(updateNewMediaItem({
            width: resourceWidth,
            height: resourceHeight
        }))

        document.getElementById('upload_file-select_image').src = src
    },

    onVideoLoad: function(src, video) {
        const { dispatch, resourceWidth, resourceHeight, resourceDuration, upload } = this.props  

        // Grab first frame using canvas element
        var canvas = document.createElement('canvas');
        canvas.width = resourceWidth;
        canvas.height = resourceHeight;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        var posterKey = `videos/FF-${upload.get('mediaItem').get('uuid')}.png`

        // Upload first frame 
        // TODO: no safari/IE compatibility!
        canvas.toBlob(blob => {
            dispatch(uploadPosterFile(blob, posterKey))
        });

        dispatch(updateNewMediaItem({
            width: resourceWidth,
            height: resourceHeight,
            duration: resourceDuration,
            posterUrl: `${upload.cloudfrontUrl()}${posterKey}`
        }))

        document.getElementById('upload_file-select_video').src = src
    }
}

export default connect()(FileComponent('upload_file-select', fileOptions)(FileSelect));
