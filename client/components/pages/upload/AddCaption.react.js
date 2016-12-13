import React from 'react'
import { connect } from 'react-redux'
import { Map } from 'immutable'

import Video from '../../room/player/Video.react'
import Photo from '../../room/player/Photo.react'
import Modal from '../../shared/Modal.react'

import { closeModal, updateNewMediaItem } from '../../../actions'

class AddCaption extends React.Component {

    constructor(props) {
        super(props)

        this.resourceObject = this.resourceObject.bind(this)
        this.decorationObject = this.decorationObject.bind(this)

        this.handleMouseDown = this.handleMouseDown.bind(this)
        this.handleMouseMove = this.handleMouseMove.bind(this)
        this.handleMouseUp = this.handleMouseUp.bind(this)

        this.handleCancel = this.handleCancel.bind(this)
        this.handleSave = this.handleSave.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)

        this.state = {
            resource: Map(),
            savedDecoration: null,
            isDraggingCaption: false
        }
    }

    componentDidMount() {
        $(window).on('mousedown', this.handleMouseDown)
        $(window).on('mousemove', this.handleMouseMove)
        $(window).on('mouseup', this.handleMouseUp)
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.app.get('activeModal') !== 'add-caption' && nextProps.app.get('activeModal') === 'add-caption') {
            // (re)opening the modal, so we save the current
            // caption here so we can reset on cancel
            this.setState({
                savedDecoration: this.props.upload.get('mediaItem').get('decoration', Map()),
                resource: this.resourceObject(nextProps)
            })
        }
    }

    componentWillUnmount() {
        $(window).off('mousedown', this.handleMouseDown)
        $(window).off('mousemove', this.handleMouseMove)
        $(window).off('mouseup', this.handleMouseUp)
    }


    // Getters

    resourceObject(props) {
        const { width, height, upload } = props 
        return Map({
            url: URL.createObjectURL(upload.get('file')),
            type: 'objectURL',
            width,
            height
        })
    }

    decorationObject() {
        const { upload } = this.props
        const decoration = upload.get('mediaItem').get('decoration', Map())

        return decoration.get('caption_text', '').length > 0 ? decoration : null
    }


    // Event handlers

    handleMouseDown(e) {
        var caption = document.getElementById('player_caption')
        console.log(e.target, caption)
        if (!caption) {
            return;
        }

        if (e.target === caption || caption.contains(e.target)) {
            this.setState({
                isDraggingCaption: true,
                offsetY: e.offsetY,
                startY: e.clientY
            })
            e.stopPropagation();
            e.preventDefault();
        }
    }

    handleMouseMove(e) {
        const { isDraggingCaption, offsetY, startY } = this.state 
        const { upload, dispatch } = this.props 

        if (isDraggingCaption) {
            var parent = document.getElementById('upload_add-caption_media-container')
            var caption = document.getElementById('player_caption')

            const parentY = parent.getBoundingClientRect().top
            const parentHeight = parent.getBoundingClientRect().height
            const captionHeight = caption.getBoundingClientRect().height

            var maxY = parentHeight-captionHeight;
            if (upload.fileType() === 'video') {
                // restrain position over video controls
                maxY -= 75
            }
            var newOffset = Math.max(0, Math.min(maxY/parentHeight, (e.clientY - offsetY - parentY)/parentHeight))
            dispatch(updateNewMediaItem({
                decoration: {
                    caption_text: upload.get('mediaItem').getIn(['decoration', 'caption_text'], ''),
                    caption_offset: newOffset
                }
            }))
        }
    }

    handleMouseUp(e) {
        this.setState({
            isDraggingCaption: false
        })
    }

    handleCancel() {
        const { dispatch } = this.props 
        const { savedDecoration } = this.state 

        // revert to saved decoration
        dispatch(updateNewMediaItem({
            decoration: savedDecoration.toJS()
        }))
        dispatch(closeModal())
    }

    handleSave() {
        this.props.dispatch(closeModal())
    }

    handleInputChange(e) {
        const { upload, dispatch } = this.props
        dispatch(updateNewMediaItem({
            decoration: {
                caption_text: e.target.value.substr(0, 140),
                caption_offset: upload.get('mediaItem').getIn(['decoration', 'caption_offset'], 0.5)
            }
        }))
    }


    // Render

    render() {
        const { upload } = this.props 
        const { resource } = this.state

        const isVideo = upload.fileType() === 'video'
        const isPhoto = upload.fileType() === 'image'

        const captionText = upload.get('mediaItem').getIn(['decoration', 'caption_text'], '')

        return (
            <Modal name="add-caption" className="upload_add-caption">
                <div id="upload_add-caption_media-container" className="upload_add-caption_media-container">
                    <div className="player_media-inner">
                        { isPhoto && <Photo image={resource} decoration={this.decorationObject()} /> }
                        { isVideo && <Video video={resource} decoration={this.decorationObject()} autoplay={false} /> }
                    </div>
                </div>
                <div className="upload_add-caption_form">
                    <input 
                        type="text" 
                        placeholder="Enter caption" 
                        className="upload_add-caption_input"
                        value={captionText}
                        onChange={this.handleInputChange}
                    />
                    <a className="btn upload_add-caption_cancel-btn" onClick={this.handleCancel}>Cancel</a>
                    <a className="btn upload_add-caption_save-btn" onClick={this.handleSave}>Save</a>
                </div>
                <div className="upload_add-caption_info">
                    Drag the caption to adjust its position on the {upload.fileType()}.
                </div>
            </Modal>
        );
    }
}

export default connect()(AddCaption);
