import React from 'react'
import { connect } from 'react-redux'
import format from 'date-fns/format'

import Icon from '../../../shared/Icon.react'
import Spinner from '../../../shared/Spinner.react'
import Dropdown from '../../../shared/Dropdown.react'
import Modal from '../../../shared/Modal.react'
import { RoomPage } from '../../../../models'
import { selectMediaItem, closeDetailSection, toggleDropdown, promptModal, closeModal, deleteMediaItem, goForward, goBackward } from '../../../../actions'

class ActivityItem extends React.Component {

     constructor(props) {
        super(props);

        this.resize = this.resize.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleOptionsClick = this.handleOptionsClick.bind(this);
        this.handleDropdownDeleteClick = this.handleDropdownDeleteClick.bind(this);
        this.handleDeleteMediaItemClick = this.handleDeleteMediaItemClick.bind(this);

        this.renderDropdown = this.renderDropdown.bind(this);
        this.renderModal = this.renderModal.bind(this);
    }

    componentDidMount() {
        const node = $(this._node);
        $(window).resize(this.resize.bind(this, node));
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.hasDeletedMediaItem && nextProps.hasDeletedMediaItem) {
            this.props.dispatch(closeModal())
            if (nextProps.selectedMediaItemId === nextProps.deletedMediaItemId) {
                this.props.dispatch(selectMediaItem(this.props.roomId, nextProps.postDeletionSelectedMediaItemId))
            }
        }
    }

    componentDidUpdate() {
        this.resize($(this._node))
    }

    componentWillUnmount() {
        $(window).off('resize', this.resize);
    }


    // Events

    resize(node) {
        const thumb = node.find('.item_thumb');
        thumb.width(thumb.height()*4.0/3.0);
    }

    handleClick() {
        const { dispatch, roomId, mediaItem } = this.props

        this.props.dispatch(selectMediaItem(roomId, mediaItem.get('id')))
        this.props.dispatch(closeDetailSection())
    }

    handleOptionsClick(e) {
        const { dispatch, mediaItem } = this.props
        e.stopPropagation()
        dispatch(toggleDropdown(`item-options-${mediaItem.get('id')}`))
    }

    handleDropdownDeleteClick(e) {
        const { dispatch, mediaItem } = this.props
        e.stopPropagation()
        dispatch(promptModal(`delete-item-${mediaItem.get('id')}`))
    }

    handleDeleteMediaItemClick(e) {
        const { dispatch, mediaItem } = this.props
        e.stopPropagation()
        dispatch(deleteMediaItem(mediaItem.get('id')))
    }


    // Render

    renderDropdown() {
        const { mediaItem, dispatch } = this.props 
        return (
            <Dropdown type={`item-options-${mediaItem.get('id')}`} triangleMargin={-1}>
                <a className="dropdown-option" onClick={this.handleDropdownDeleteClick}>Delete Post</a>
            </Dropdown>
        )
    }

    renderModal() {
        const { mediaItem, isDeletingMediaItem, deleteMediaItemError, dispatch } = this.props
        return (
            <Modal name={`delete-item-${mediaItem.get('id')}`} className="modal-alert">
                <div className="modal_header">
                    Delete post
                </div>
                <div className="modal-alert_text">
                    Are you sure you want to delete this post? <b>This action cannot be reversed.</b>
                </div>
                { deleteMediaItemError && 
                    <div className="modal-alert_error">There was an error processing your request. Please try again.</div>
                }
                <a className="modal-alert_btn btn" onClick={this.handleDeleteMediaItemClick}>
                    { isDeletingMediaItem ? <Spinner type="white" /> : 'Delete post' }
                </a>
                <a className="modal-alert_btn btn btn-gray" onClick={() => {dispatch(closeModal())}}>
                    Cancel
                </a>
            </Modal>
        )
    }

    render() {
        const { mediaItem, live, index, isUnseen, currentUserIsAuthor, selectedMediaItemId } = this.props;

        let selected = mediaItem.get('id') === selectedMediaItemId

        const url = mediaItem.thumbnail('small').get('url')
        const selectedClass = selected ? "selected" : "";
        const liveClass = live && isUnseen ? "live" : "";
        const videoClass = mediaItem.get('type') === 'video' ? "item-activity_video-wrapper" : "";
        const currentUserClass = currentUserIsAuthor ? "current-user" : ""
        
        return (
            <div className={`item item-activity ${selectedClass} ${liveClass} ${currentUserClass}`} onClick={this.handleClick} ref={(c) => this._node = c}>
                <div className="item_inner">
                    <div className="item_thumb" style={{ backgroundImage: `url(${url})`}}>
                        { mediaItem.get('type') === 'video' && <Icon type="video" /> }
                    </div>
                    <div className="item_main">
                        <div className="item-activity_index"><span>{index+1}</span></div>
                        <div className="item-activity_time"><span>{format(mediaItem.get('user_created_at'), 'h:mm a')}</span></div>
                    </div>
                </div>
                { currentUserIsAuthor && 
                    <div className="item-activity_options" onClick={this.handleOptionsClick}><Icon type="more-vert" /></div>
                }
                { this.renderDropdown() }
                { this.renderModal() }
            </div>
        );
    }
}

ActivityItem.propTypes = {
    mediaItem: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    live: React.PropTypes.bool
}

function mapStateToProps(state, ownProps) {
    let roomPage = new RoomPage(state)
    let postDeletionSelectedMediaItem = roomPage.mediaItems().first() || roomPage.liveMediaItems().first()

    return {
        roomId: roomPage.get('id'),
        currentUserIsAuthor: roomPage.currentUserIsAuthor(),
        // triggers componentDidUpdate when user switches detail section, which prompts resize call
        selectedDetailSection: roomPage.get('selectedDetailSection'),

        isUnseen: roomPage.isUnseen(ownProps.mediaItem.get('id')),
        selectedMediaItemId: roomPage.get('selectedMediaItemId'),

        isDeletingMediaItem: roomPage.get('isDeletingMediaItem'),
        hasDeletedMediaItem: roomPage.get('hasDeletedMediaItem'),
        deletedMediaItemId: roomPage.get('deletedMediaItemId'),
        postDeletionSelectedMediaItemId: postDeletionSelectedMediaItem.get('id')
    }
}

function areOwnPropsEqual(prevProps, nextProps) {
    return prevProps.mediaItem.isEqual(nextProps.mediaItem) 
        && prevProps.index === nextProps.index 
        && prevProps.live === nextProps.live
}

export default connect(mapStateToProps, null, null, { areOwnPropsEqual })(ActivityItem);
