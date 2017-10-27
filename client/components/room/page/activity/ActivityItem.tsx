import * as React from 'react'
import { connect } from 'react-redux'
import * as format from 'date-fns/format'

import Icon from '@components/shared/Icon'
import Spinner from '@components/shared/Spinner'
import Dropdown from '@components/shared/Dropdown'
import Modal from '@components/shared/Modal'
import RoomPage from '@models/state/pages/room'
import Room from '@models/state/room'
import MediaItem from '@models/entities/mediaItem'
import { toggleDropdown, promptModal, closeModal } from '@actions/app'
import { closeDetailSection,  deleteMediaItem, } from '@actions/pages/room'
import { selectMediaItem, goForward, goBackward } from '@actions/room'
import { State, DispatchProps } from '@types'

interface OwnProps {
    mediaItem: MediaItem
    index: number
    live?: boolean
}

interface ConnectProps {
    roomId: number
    authorUsername: string
    isCurrentUserAuthor: boolean
    selectedDetailSection: string

    isUnseen: boolean
    selectedMediaItemId: number

    isDeletingMediaItem: boolean
    hasDeletedMediaItem: boolean
    deleteMediaItemError: string
    deletedMediaItemId: number
    postDeletionSelectedMediaItemId: number
}

type Props = OwnProps & ConnectProps & DispatchProps

class ActivityItem extends React.Component<Props> {

    static defaultProps: Partial<Props> = {
        live: false
    }

    constructor(props: Props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.handleOptionsClick = this.handleOptionsClick.bind(this);
        this.handleDropdownDeleteClick = this.handleDropdownDeleteClick.bind(this);
        this.handleDeleteMediaItemClick = this.handleDeleteMediaItemClick.bind(this);

        this.renderDropdown = this.renderDropdown.bind(this);
        this.renderModal = this.renderModal.bind(this);
    }


    componentWillReceiveProps(nextProps: Props) {
        if (!this.props.hasDeletedMediaItem && nextProps.hasDeletedMediaItem) {
            this.props.dispatch(closeModal())
            if (nextProps.selectedMediaItemId === nextProps.deletedMediaItemId) {
                this.props.dispatch(selectMediaItem(this.props.roomId, nextProps.postDeletionSelectedMediaItemId))
            }
        }
    }

    // Events

    handleClick() {
        const { dispatch, roomId, mediaItem } = this.props

        this.props.dispatch(selectMediaItem(roomId, mediaItem.get('id')))
        this.props.dispatch(closeDetailSection())
    }

    handleOptionsClick(e: React.MouseEvent<HTMLElement>) {
        const { dispatch, mediaItem } = this.props
        e.stopPropagation()
        dispatch(toggleDropdown(`item-options-${mediaItem.get('id')}`))
    }

    handleDropdownDeleteClick(e: React.MouseEvent<HTMLElement>) {
        const { dispatch, mediaItem } = this.props
        e.stopPropagation()
        dispatch(promptModal(`delete-item-${mediaItem.get('id')}`))
    }

    handleDeleteMediaItemClick(e: React.MouseEvent<HTMLElement>) {
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
                    { isDeletingMediaItem ? <Spinner styles={["white"]} /> : 'Delete post' }
                </a>
                <a className="modal-alert_btn btn btn-gray" onClick={() => {dispatch(closeModal())}}>
                    Cancel
                </a>
            </Modal>
        )
    }

    render() {
        const { mediaItem, live, index, isUnseen, authorUsername, isCurrentUserAuthor, selectedMediaItemId } = this.props;

        let selected = mediaItem.get('id') === selectedMediaItemId

        const url = mediaItem.thumbnail('small').get('url')
        const selectedClass = selected ? "selected" : "";
        const liveClass = live && isUnseen ? "live" : "";
        const typeString = mediaItem.get('type') === 'video' ? "a video" : "an image"
        const currentUserClass = isCurrentUserAuthor ? "current-user" : ""
        const referencedComment = mediaItem.hasReference() && mediaItem.referencedComment()
        
        return (
            <div className={`activity-item ${selectedClass} ${liveClass} ${currentUserClass}`} onClick={this.handleClick}>
                <div className="activity-item_inner">
                    <div className="activity-item_main">
                        <div className="activity-item_thumb" style={{ backgroundImage: `url(${url})`}} />
                        <div className="activity-item_text">
                            {authorUsername} added {typeString}. 
                            <span className="activity-item_text-timestamp">{format(mediaItem.get('user_created_at'), 'h:mm a')}</span>
                        </div>
                    </div>
                    { referencedComment &&
                    <div className="activity-item_comment">
                        { referencedComment.get('message') }
                    </div>
                    }
                </div>
                { isCurrentUserAuthor && 
                    <div className="activity-item_options" onClick={this.handleOptionsClick}><Icon type="more-vert" /></div>
                }
                { this.renderDropdown() }
                { this.renderModal() }
            </div>
        );
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    let postDeletionSelectedMediaItem = RoomPage.mediaItems(state).first() || RoomPage.liveMediaItems(state).first() as MediaItem
    
    return {
        roomId: RoomPage.get(state, 'id'),
        authorUsername: RoomPage.entity(state).author().get('username'),
        isCurrentUserAuthor: RoomPage.isCurrentUserAuthor(state),
        // triggers componentDidUpdate when user switches detail section, which prompts resize call
        selectedDetailSection: RoomPage.get(state, 'selectedDetailSection'),

        isUnseen: RoomPage.isUnseen(state, ownProps.mediaItem.get('id')),
        selectedMediaItemId: Room.get(state, RoomPage.get(state, 'id'), 'selectedMediaItemId'),

        isDeletingMediaItem: RoomPage.get(state, 'isDeletingMediaItem'),
        hasDeletedMediaItem: RoomPage.get(state, 'hasDeletedMediaItem'),
        deleteMediaItemError: RoomPage.get(state, 'deleteMediaItemError'),
        deletedMediaItemId: RoomPage.get(state, 'deletedMediaItemId'),
        postDeletionSelectedMediaItemId: postDeletionSelectedMediaItem.get('id')
    }
}

export default connect(mapStateToProps)(ActivityItem);
