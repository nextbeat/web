import React from 'react'
import { connect } from 'react-redux' 
import { assign } from 'lodash'

import AddCaption from './AddCaption.react'
import Icon from '../shared/Icon.react'
import { uploadFile, uploadPosterFile, updateNewMediaItem, promptModal } from '../../actions'

// Calculate size and offset of resource based on
// its intrinsic width and height and the dimensions
// of its parent element
function resourceDimensions(rWidth, rHeight) {
    const parent = $('.upload_file-select')
    const pWidth = parent.width()
    const pHeight = parent.height()

    const rRatio = rWidth/rHeight
    const pRatio = pWidth/pHeight

    let width = 0,
        height = 0,
        offsetX = 0,
        offsetY = 0

    if (rRatio > pRatio) {
        height = pHeight
        width = rWidth * pHeight/rHeight
        offsetX = (pWidth - width)/2
    } else {
        width = pWidth;
        height = rHeight * pWidth/rWidth
        offsetY = (pHeight - height)/2
    }

    return { width, height, offsetX, offsetY }
}

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
            isDragging: false,
            resourceLoaded: false,
            resourceWidth: 0,
            resourceHeight: 0,
            width: 0,
            height: 0,
            offsetX: 0,
            offsetY: 0
        }
    }

    // Component lifecycle

    componentDidUpdate(prevProps) {

        if (prevProps.upload.get('file') !== this.props.upload.get('file') && !this.state.resourceLoaded) {
            if (this.props.upload.fileType() === 'image') {
                this.loadImage(this.props.upload.get('file'))
            } else if (this.props.upload.fileType() === 'video') {
                this.loadVideo(this.props.upload.get('file'))
            }
        }

        if (prevProps.upload.has('file') && !this.props.upload.has('file')) {
            // has cleared upload
            this.setState({
                resourceLoaded: false
            })
        }

    }


    // File loading

    loadImage(file) {
        const image = document.getElementById('upload_file-select_image')

        image.addEventListener('load', e => {
            URL.revokeObjectURL(file)
            const width = e.target.width
            const height = e.target.height

            // update image data for the media item to be submitted
            this.props.dispatch(updateNewMediaItem({
                width,
                height
            }))

            // calculate appropriate image dimensions for display
            this.setState(assign({}, resourceDimensions(width, height), {
                resourceLoaded: true,
                resourceWidth: width,
                resourceHeight: height,
            }))
        })

        image.src = URL.createObjectURL(file)
    }

    loadVideo(file) {
        const video = document.getElementById('upload_file-select_video')
        const { dispatch, upload } = this.props
 
        video.addEventListener('loadeddata', e => {
            URL.revokeObjectURL(file)
            const width = e.target.videoWidth
            const height = e.target.videoHeight
            const duration = e.target.duration

            // Grab first frame using canvas element
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            var posterKey = `videos/FF-${upload.get('mediaItem').get('uuid')}.png`

            // Upload first frame 
            canvas.toBlob(blob => {
                dispatch(uploadPosterFile(blob, posterKey))
            });

            dispatch(updateNewMediaItem({
                width,
                height,
                duration,
                posterUrl: `${upload.cloudfrontUrl()}${posterKey}`
            }))

            this.setState(assign({}, resourceDimensions(width, height), {
                resourceLoaded: true,
                resourceWidth: width,
                resourceHeight: height
            }))
        })

        video.src = URL.createObjectURL(file)
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
        const { upload } = this.props

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
                <div className="upload_drag-label">Or drag it here.</div>
            </div>
        );
    }

    renderUploadProgress() {
        const { resourceLoaded, resourceWidth, resourceHeight, width, height, offsetX, offsetY } = this.state 
        const { upload, app } = this.props 

        const isImage = upload.fileType() === 'image'
        const isVideo = upload.fileType() === 'video'
        const hasDecoration = upload.get('mediaItem').getIn(['decoration', 'caption_text'], '').length > 0

        return (
            <div className="upload_file-select">
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

export default connect()(FileSelect);
