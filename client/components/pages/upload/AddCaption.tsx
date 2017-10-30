import * as React from 'react'
import { connect } from 'react-redux'
import { Map } from 'immutable'
import assign from 'lodash-es/assign'

import Video from '@components/room/player/Video'
import Image from '@components/room/player/Image'
import Modal from '@components/shared/Modal'

import { updateNewMediaItem } from '@actions/upload'
import { closeModal } from '@actions/app'
import Upload, { UploadType } from '@models/state/upload'
import App from '@models/state/app'
import { isBrowserCompatible } from '@upload'
import { State, DispatchProps } from '@types'

interface OwnProps {
    width: number
    height: number
}

interface ConnectProps {
    isActiveModal: boolean

    file: File
    mediaItem: State
    isDoneProcessing: boolean
    fileType: 'image' | 'video' | null
}

type Props = OwnProps & ConnectProps & DispatchProps

interface ComponentState {
    resource: State
    savedDecoration: State
    isDraggingCaption: boolean
    containerWidth: number
    containerHeight: number
    offsetY: number
    startY: number
}

// extract relevant position data from touch event
function processEventData(evt: JQuery.Event) {
    if ('touches' in evt.originalEvent) {
        if ((evt.originalEvent as any).touches.length !== 1) {
            return null; 
        }
        let touch = (evt.originalEvent as any).touches[0]
        let rect = touch.target.getBoundingClientRect()
        return assign(touch, { offsetY: touch.clientY - rect.top })
    } else {
        return evt;
    }
}

class AddCaption extends React.Component<Props, ComponentState> {

    constructor(props: Props) {
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
            savedDecoration: Map(),
            isDraggingCaption: false,
            containerWidth: 0,
            containerHeight: 0,
            offsetY: 0,
            startY: 0
        }
    }

    componentDidMount() {
        $(document).on('mousedown touchstart', this.handleMouseDown)
        $(document).on('mousemove touchmove', this.handleMouseMove)
        $(document).on('mouseup touchend', this.handleMouseUp)
        $(window).on('resize', this.handleResize)

        this.handleResize()
    }

    componentWillReceiveProps(nextProps: Props) {
        if (!this.props.isActiveModal && nextProps.isActiveModal) {
            // (re)opening the modal, so we save the current
            // caption here so we can reset on cancel
            this.setState({
                savedDecoration: this.props.mediaItem.get('decoration', Map()),
                resource: this.resourceObject(nextProps)
            })
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (!prevProps.isActiveModal && this.props.isActiveModal) {
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

    resourceObject(props: Props): State {
        const { width, height, file, isDoneProcessing, mediaItem } = props 
        let object = 
        Map<string, any>()

        if (isBrowserCompatible(file)) {
            object = Map({
                url: URL.createObjectURL(file),
                type: 'objectURL',
                width,
                height
            })
        } else if (isDoneProcessing) {
            object = mediaItem.get('processedItem').delete('item_type')
        }

        return object

    }

    decorationObject(): State | undefined {
        const { mediaItem } = this.props
        const decoration = mediaItem.get('decoration', Map())

        return decoration.get('caption_text', '').length > 0 ? decoration : undefined
    }


    // Event handlers

    handleResize() {
        const containerWidth = parseInt($('.player_media-inner').css('width'));
        const containerHeight = Math.min(340, Math.floor(containerWidth * 9 / 16));
        this.setState({
            containerWidth,
            containerHeight
        })
    }

    handleMouseDown(e: JQuery.Event) {
        var caption = document.getElementById('player_caption')
        if (!caption) {
            return;
        }

        e = processEventData(e);

        if (e && (e.target === caption || caption.contains(e.target as any))) {
            this.setState({
                isDraggingCaption: true,
                offsetY: e.offsetY || 0,
                startY: e.clientY || 0
            })
            e.stopPropagation();
            e.preventDefault();
        }
    }

    handleMouseMove(e: JQuery.Event) {
        const { isDraggingCaption, offsetY, startY } = this.state 
        const { fileType, mediaItem, dispatch } = this.props 

        e = processEventData(e);

        if (e && isDraggingCaption) {
            var parent = document.getElementById('upload_add-caption_media-container') as HTMLElement
            var caption = document.getElementById('player_caption') as HTMLElement

            const parentY = parent.getBoundingClientRect().top
            const parentHeight = parent.getBoundingClientRect().height
            const captionHeight = caption.getBoundingClientRect().height

            var maxY = parentHeight-captionHeight;
            if (fileType === 'video') {
                // restrain position over video controls
                maxY -= 75
            }
            var newOffset = Math.max(0, Math.min(maxY/parentHeight, ((e.clientY || 0) - offsetY - parentY)/parentHeight))
            dispatch(updateNewMediaItem({
                decoration: {
                    caption_text: mediaItem.getIn(['decoration', 'caption_text'], ''),
                    caption_offset: newOffset
                }
            }))
        }
    }

    handleMouseUp(e: JQuery.Event) {
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

    handleInputChange(e: React.FormEvent<HTMLInputElement>) {
        const { mediaItem, dispatch } = this.props
        dispatch(updateNewMediaItem({
            decoration: {
                caption_text: e.currentTarget.value.substr(0, 140),
                caption_offset: mediaItem.getIn(['decoration', 'caption_offset'], 0.5)
            }
        }))
    }


    // Render

    render() {
        const { fileType, mediaItem } = this.props 
        const { resource, containerWidth, containerHeight } = this.state

        const isVideo = fileType === 'video'
        const isImage = fileType === 'image'

        const captionText = mediaItem.getIn(['decoration', 'caption_text'], '')

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
                    Drag the caption to adjust its position on the {fileType}.
                </div>
            </Modal>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isActiveModal: App.get(state, 'activeModal') === 'add-caption',
        file: Upload.getInFile(state, UploadType.MediaItem, 'file'),
        mediaItem: Upload.get(state, 'mediaItem', Map()),
        isDoneProcessing: Upload.isDoneProcessing(state, UploadType.MediaItem),
        fileType: Upload.fileType(state, UploadType.MediaItem)
    }
}

export default connect(mapStateToProps)(AddCaption);
