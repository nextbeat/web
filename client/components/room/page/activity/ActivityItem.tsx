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
import Comment from '@models/entities/comment'
import { toggleDropdown, promptModal, closeModal } from '@actions/app'
import { deleteMediaItem, editMediaItemTitle } from '@actions/pages/room'
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

    isEditingMediaItemTitle: boolean 
    hasEditedMediaItemTitle: boolean 
    editedMediaItemId: number
    editMediaItemTitleError: string
}

interface ComponentState {
    editedTitle: string
}

type Props = OwnProps & ConnectProps & DispatchProps

class ActivityItem extends React.Component<Props, ComponentState> {

    static defaultProps: Partial<Props> = {
        live: false
    }

    constructor(props: Props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.handleOptionsClick = this.handleOptionsClick.bind(this);
        this.handleDropdownDeleteClick = this.handleDropdownDeleteClick.bind(this);
        this.handleDeleteMediaItemClick = this.handleDeleteMediaItemClick.bind(this);

        this.handleDropdownEditTitleClick = this.handleDropdownEditTitleClick.bind(this);
        this.handleEditMediaItemClick = this.handleEditMediaItemClick.bind(this);
        this.handleEditMediaItemChange = this.handleEditMediaItemChange.bind(this);

        this.renderDropdown = this.renderDropdown.bind(this);
        this.renderDeleteModal = this.renderDeleteModal.bind(this);
        this.renderEditTitleModal = this.renderEditTitleModal.bind(this);
        this.renderReferencedComment = this.renderReferencedComment.bind(this);

        this.state = {
            editedTitle: ''
        }
    }

    componentDidMount() {
        if (!!this.props.mediaItem.get('title')) {
            this.setState({ editedTitle: this.props.mediaItem.get('title') || '' })
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.mediaItem.get('id') === nextProps.deletedMediaItemId
            && !this.props.hasDeletedMediaItem && nextProps.hasDeletedMediaItem
        ) {
            this.props.dispatch(closeModal())
        }

        if (this.props.mediaItem.get('id') === nextProps.editedMediaItemId 
            && !this.props.hasEditedMediaItemTitle && nextProps.hasEditedMediaItemTitle
        ) {
            this.props.dispatch(closeModal())
        }

        if (this.props.mediaItem.get('title') !== nextProps.mediaItem.get('title')) {
            this.setState({ editedTitle: nextProps.mediaItem.get('title') || '' })
        }
    }

    // Events

    handleClick() {
        const { dispatch, roomId, mediaItem } = this.props

        this.props.dispatch(selectMediaItem(roomId, mediaItem.get('id')))
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

    handleDropdownEditTitleClick(e: React.MouseEvent<HTMLElement>) {
        const { dispatch, mediaItem } = this.props
        e.stopPropagation()
        dispatch(promptModal(`edit-title-${mediaItem.get('id')}`))
    }

    handleEditMediaItemClick(e: React.MouseEvent<HTMLElement>) {
        const { dispatch, mediaItem } = this.props
        const { editedTitle } = this.state
        e.stopPropagation()
        dispatch(editMediaItemTitle(mediaItem.get('id'), editedTitle))
    }
    
    handleEditMediaItemChange(e: React.FormEvent<HTMLInputElement>) {
        e.stopPropagation()
        this.setState({ editedTitle: e.currentTarget.value.substring(0, 120) })
    }


    // Render

    renderDropdown() {
        const { mediaItem, dispatch } = this.props 

        return (
            <Dropdown type={`item-options-${mediaItem.get('id')}`} triangleMargin={-1}>
                { !mediaItem.hasReference() && <a className="dropdown-option" onClick={this.handleDropdownEditTitleClick}>{mediaItem.hasTitle() ? 'Edit' : 'Add'} Title</a> }
                <a className="dropdown-option" onClick={this.handleDropdownDeleteClick}>Delete Post</a>
            </Dropdown>
        )
    }

    renderDeleteModal() {
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

    renderEditTitleModal() {
        const { mediaItem, isEditingMediaItemTitle, editMediaItemTitleError, dispatch } = this.props
        const { editedTitle } = this.state

        return (
            <Modal name={`edit-title-${mediaItem.get('id')}`} className="modal-alert">
                <div className="modal_header">
                    { !!mediaItem.get('title') ? 'Edit' : 'Add' } post title
                </div>
                <div className="modal-alert_text">
                    To remove the post title, leave the text field blank.
                </div>
                <input className="modal-alert_input" type="text" onChange={this.handleEditMediaItemChange} value={editedTitle} placeholder="Post Title" />
                <a className="modal-alert_btn btn" onClick={this.handleEditMediaItemClick}>
                    { isEditingMediaItemTitle? <Spinner styles={["white"]} /> : 'Submit' }
                </a>
                <a className="modal-alert_btn btn btn-gray" onClick={() => {dispatch(closeModal())}}>
                    Cancel
                </a>
            </Modal>
        )
    }

    renderReferencedComment() {
        const { mediaItem } = this.props
        const referencedComment = (mediaItem.hasReference() && mediaItem.referencedComment()) as Comment

        return (
            <div>
                <div className="activity-item_comment">
                    <div className="activity-item_comment_header">
                        <span className="activity-item_comment_username">{ referencedComment.author().get('username') }</span>
                        <span className="activity-item_comment_timestamp">{ format(referencedComment.get('created_at'), 'h:mm a') }</span>
                    </div>
                    <div className="activity-item_body">
                        { referencedComment.get('message') }
                    </div>
                </div>
            </div>
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
            <div className={`activity-item ${selectedClass} ${liveClass} ${currentUserClass}`}>
                <div className="activity-item_inner" onClick={this.handleClick}>
                    <div className="activity-item_main">
                        <div className="activity-item_thumb" style={{ backgroundImage: `url(${url})`}} />
                        <div className="activity-item_content">
                            { !!mediaItem.get('title') &&
                                <div className="activity-item_title">{mediaItem.get('title')}</div> 
                            }
                            { referencedComment && this.renderReferencedComment() }
                            { !mediaItem.get('title') && !referencedComment &&
                                <div className="activity-item_no-title">
                                    {authorUsername} added {typeString}. 
                                </div>
                            }
                            <div className="activity-item_timestamp">{format(mediaItem.get('user_created_at'), 'h:mm a')}</div>
                        </div>
                    </div>
                    
                </div>
                { isCurrentUserAuthor && 
                    <div className="activity-item_options" onClick={this.handleOptionsClick}><Icon type="more-vert" /></div>
                }
                { this.renderDropdown() }
                { this.renderDeleteModal() }
                { this.renderEditTitleModal() }
            </div>
        );
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {    
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

        isEditingMediaItemTitle: RoomPage.get(state, 'isEditingMediaItemTitle'),
        hasEditedMediaItemTitle: RoomPage.get(state, 'hasEditedMediaItemTitle'),
        editedMediaItemId: RoomPage.get(state, 'editedMediaItemId'),
        editMediaItemTitleError: RoomPage.get(state, 'editMediaItemTitleError')
    }
}

export default connect(mapStateToProps)(ActivityItem);
