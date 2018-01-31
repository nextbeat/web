import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import EditThumbnailModal from './EditThumbnailModal'
import CreateRoomThumbnail from './CreateRoomThumbnail'
import Icon from '@components/shared/Icon'
import Select from '@components/shared/Select'
import TagsInput from '@components/room/edit/TagsInput'

import { selectStackForUpload, updateNewStack } from '@actions/upload'
import { promptModal } from '@actions/app'
import Upload from '@models/state/upload'
import CurrentUser from '@models/state/currentUser'
import Stack from '@models/entities/stack'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    openStacks: List<Stack>
    newStack: State
}

type Props = ConnectProps & DispatchProps

class CreateRoom extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleClose = this.handleClose.bind(this)
        this.updateTags = this.updateTags.bind(this)

        this.handleTitleChange = this.handleTitleChange.bind(this)
        this.handleStatusChange = this.handleStatusChange.bind(this)
        this.handleEditThumbnailClick = this.handleEditThumbnailClick.bind(this)
    }


    // Event handlers

    updateTags(tags: List<string>) {
        this.props.dispatch(updateNewStack({ tags }))
    }

    handleClose() {
        // deselects new stack item
        this.props.dispatch(selectStackForUpload(0))
    }

    handleTitleChange(e: React.FormEvent<HTMLInputElement>) {
        this.props.dispatch(updateNewStack({ 
            title: e.currentTarget.value.substring(0, 60)
        }))
    }

    handleStatusChange(value: string) {
        this.props.dispatch(updateNewStack({
            privacyStatus: value
        }))
    }

    handleEditThumbnailClick() {
        this.props.dispatch(promptModal('edit-thumbnail'))
    }


    // Render

    render() {
        const { newStack, openStacks } = this.props

        return (
            <div className="upload_create-room upload_section">
                <EditThumbnailModal />
                <div className="upload_subheader">
                    Make new room
                    { openStacks.size > 0 && <div onClick={this.handleClose}><Icon type="close" /></div> }
                </div>
                <div className="upload_create-room_form">
                    <div className="upload_create-room_left">
                        <div className="upload_create-room_thumb">
                            <CreateRoomThumbnail />
                            <div className="upload_create-room_thumb_prompt" onClick={this.handleEditThumbnailClick}>
                                Edit thumbnail
                            </div>
                        </div>
                    </div>
                    <div className="upload_create-room_main">
                        <input className="upload_input" type="text" value={newStack.get('title')} onChange={this.handleTitleChange} placeholder="Title" />
                        <TagsInput tags={newStack.get('tags')} onChange={this.updateTags} />
                    </div>
                    <div className="upload_create-room_right">
                        <Select selected={newStack.get('privacyStatus')} values={['public', 'unlisted']} onChange={this.handleStatusChange} />
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        openStacks: CurrentUser.openStacks(state),
        newStack: Upload.get(state, 'newStack')
    }
}

export default connect(mapStateToProps)(CreateRoom);
