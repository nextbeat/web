import React from 'react'
import { connect } from 'react-redux'
import { Map } from 'immutable'
import assign from 'lodash/assign'

import Video from '../../room/player/Video.react'
import Image from '../../room/player/Image.react'
import Modal from '../../shared/Modal.react'

import { closeModal, updateNewMediaItem, UploadTypes } from '../../../actions'

// extract relevant position data from touch event
function processEventData(evt) {
    if ('touches' in evt.originalEvent) {
        if (evt.originalEvent.touches.length !== 1) {
            return null; 
        }
        let touch = evt.originalEvent.touches[0]
        let rect = touch.target.getBoundingClientRect()
        return assign(touch, { offsetY: touch.clientY - rect.top })
    } else {
        return evt;
    }
}

class AddCaption extends React.Component {

    constructor(props) {
        super(props)

        this.resourceObject = this.resourceObject.bind(this)
        this.decorationObject = this.decorationObject.bind(this)

        this.handleMouseDown = this.handleMouseDown.bind(this)
        this.handleMouseMove = this.handleMouseMove.bind(this)
        this.handleMouseUp = this.handleMouseUp.bind(this)
        this.handleResize = this.handleResize.bind(this)

        this.handleCancel = this.handleCancel.bind(this)
        this.handleSave = this.handleSave.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)

        this.state = {
            resource: Map(),
            savedDecoration: null,
            isDraggingCaption: false,
            containerWidth: 0,
            containerHeight: 0
        }
    }

    componentDidMount() {
        $(document).on('mousedown touchstart', this.handleMouseDown)
        $(document).on('mousemove touchmove', this.handleMouseMove)
        $(document).on('mouseup touchend', this.handleMouseUp)
        $(window).on('resize', this.handleResize)

        this.handleResize()
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

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.app.get('activeModal') !== 'add-caption' && this.props.app.get('activeModal') === 'add-caption') {
            this.handleResize()
        }
    }

    componentWillUnmount() {
        $(document).off('mousedown touchstart', this.handleMouseDown)
        $(document).off('mousemove touchmove', this.handleMouseMove)
        $(document).off('mouseup touchend', this.handleMouseUp)
        $(window).off('resize', this.handleResize)
    }


    // Getters

    resourceObject(props) {
        const { width, height, upload } = props 
        let object = {};

        if (upload.isBrowserCompatible(UploadTypes.MEDIA_ITEM)) {
            object = Map({
                url: URL.createObjectURL(upload.get(UploadTypes.MEDIA_ITEM, 'file')),
                type: 'objectURL',
                width,
                height
            })
        } else if (upload.isDoneProcessing()) {
            object = upload.get('mediaItem').get('processedItem').delete('item_type')
        }

        return object

    }

    decorationObject() {
        const { upload } = this.props
        const decoration = upload.get('mediaItem').get('decoration', Map())

        return decoration.get('caption_text', '').length > 0 ? decoration : null
    }


    // Event handlers

    handleResize(e) {
        const containerWidth = parseInt($('.player_media-inner').css('width'));
        const containerHeight = Math.min(340, Math.floor(containerWidth * 9 / 16));
        this.setState({
            containerWidth,
            containerHeight
        })
    }

    handleMouseDown(e) {
        var caption = document.getElementById('player_caption')
        if (!caption) {
            return;
        }

        e = processEventData(e);

        if (e && (e.target === caption || caption.contains(e.target))) {
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

        e = processEventData(e);

        if (e && isDraggingCaption) {
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
        const { resource, containerWidth, containerHeight } = this.state

        const isVideo = upload.fileType() === 'video'
        const isImage = upload.fileType() === 'image'

        const captionText = upload.get('mediaItem').getIn(['decoration', 'caption_text'], '')

        const containerProps = { containerWidth, containerHeight }

        return (
            <Modal name="add-caption" className="upload_add-caption">
                <div id="upload_add-caption_media-container" className="upload_add-caption_media-container">
                    <div className="upload_add-caption_media" >
                        <div className="player_media-inner" style={{ height: `${containerHeight}px` }}>
                            { isImage && <Image image={resource} decoration={this.decorationObject()} hideControls={true} {...containerProps} /> }
                            { isVideo && <Video video={resource} decoration={this.decorationObject()} autoplay={false} {...containerProps} /> }
                        </div>
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
                    <div className="upload_add-caption_buttons">
                        <a className="btn upload_add-caption_cancel-btn" onClick={this.handleCancel}>Cancel</a>
                        <a className="btn upload_add-caption_save-btn" onClick={this.handleSave}>Save</a>
                    </div>
                </div>
                <div className="upload_add-caption_info">
                    Drag the caption to adjust its position on the {upload.fileType()}.
                </div>
            </Modal>
        );
    }
}

export default connect()(AddCaption);
