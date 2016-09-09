import React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import EditThumbnail from './EditThumbnail.react'
import CreateRoomThumbnail from './CreateRoomThumbnail.react'
import Icon from '../shared/Icon.react'
import Spinner from '../shared/Spinner.react'
import { selectStackForUpload, updateNewStack, promptModal } from '../../actions'

const MAX_TAG_COUNT = 5;

class CreateRoom extends React.Component {

    constructor(props) {
        super(props)

        this.handleClose = this.handleClose.bind(this)
        this.handleTagClose = this.handleTagClose.bind(this)
        this.handleTitleChange = this.handleTitleChange.bind(this)
        this.handleTagChange = this.handleTagChange.bind(this)
        this.handleTagKeyDown = this.handleTagKeyDown.bind(this)
        this.handleTagBlur = this.handleTagBlur.bind(this)
        this.handleStatusChange = this.handleStatusChange.bind(this)
        this.handleEditThumbnailClick = this.handleEditThumbnailClick.bind(this)

        this.renderTag = this.renderTag.bind(this)

        this.state = {
            currentTagString: '',
        }
    }


    // Event handlers

    handleClose() {
        // deselects new stack item
        this.props.dispatch(selectStackForUpload(null))
    }

    handleTagClose(idx) {
        const { dispatch, upload } = this.props 
        const tags = upload.get('newStack').get('tags')

        this.props.dispatch(updateNewStack({
            tags: tags.delete(idx)
        }))
    }

    handleTitleChange(e) {
        this.props.dispatch(updateNewStack({ 
            title: e.target.value 
        }))
    }

    handleTagChange(e) {
        const { upload, dispatch } = this.props 
        const tags = upload.get('newStack').get('tags')
        if (tags.size >= MAX_TAG_COUNT) {
            return;
        }

        const value = e.target.value
        if ([',', ' '].indexOf(value[value.length-1]) !== -1) {
            const tag = value.substr(0, value.length-1)
            if (tag.length > 0) {
                this.setState({
                    currentTagString: ''
                })
                dispatch(updateNewStack({
                    tags: tags.push(tag)
                }))
            }
        } else {
            this.setState({ currentTagString: e.target.value })
        }
    }

    handleTagKeyDown(e) {
        // key press doesn't register backspace for some reason
        const { currentTagString } = this.state 
        const { upload, dispatch } = this.props 
        const tags = upload.get('newStack').get('tags')

        if (e.keyCode === 8 && currentTagString.length === 0) { // backspace
            e.preventDefault()

            this.setState({
                currentTagString: tags.last()
            })
            dispatch(updateNewStack({
                tags: tags.pop()
            }))
            process.nextTick(() => {
                e.target.select()
            })
        }
    }

    handleTagBlur() {
        // turn last string into a tag
        const { currentTagString } = this.state
        const { upload, dispatch } = this.props  
        const tags = upload.get('newStack').get('tags')

        if (currentTagString.length > 0) {
            if (tags.size < MAX_TAG_COUNT) {
                dispatch(updateNewStack({
                    tags: tags.push(currentTagString)
                }))
            }
            this.setState({
                currentTagString: ''
            })
        }
    }

    handleStatusChange(e) {
        this.props.dispatch(updateNewStack({
            privacyStatus: e.target.value
        }))
    }

    handleEditThumbnailClick(e) {
        this.props.dispatch(promptModal('edit-thumbnail'))
    }


    // Render

    renderTag(tag, index) {
        return (
            <div className="upload_create-room_tag" key={index}>
                {tag}
                <div onClick={this.handleTagClose.bind(this, index)}><Icon type="close" /></div>
            </div>
        )
    }

    render() {
        const { currentTagString } = this.state 
        const { upload, stacks } = this.props

        const newStack = upload.get('newStack')

        return (
            <div className="upload_create-room">
                <EditThumbnail />
                <div className="upload_subheader">
                    Make new room
                    { stacks.size > 0 && <div onClick={this.handleClose}><Icon type="close" /></div> }
                </div>
                <div className="upload_create-room_form">
                    <div className="upload_create-room_left">
                        <div className="upload_create-room_thumb">
                            <CreateRoomThumbnail upload={upload} file={upload.get('file')} />
                            <div className="upload_create-room_thumb_prompt" onClick={this.handleEditThumbnailClick}>
                                Edit thumbnail
                            </div>
                        </div>
                    </div>
                    <div className="upload_create-room_main">
                        <input type="text" value={newStack.get('title')} onChange={this.handleTitleChange} placeholder="Title" />
                        <div className="upload_create-room_tags-container">
                            { newStack.get('tags').map((tag, idx) => this.renderTag(tag, idx) ) }
                            <input type="text" 
                                className="upload_create-room_tags-input" 
                                value={currentTagString} 
                                onChange={this.handleTagChange} 
                                onKeyDown={this.handleTagKeyDown}
                                onBlur={this.handleTagBlur}
                                placeholder={newStack.get('tags').size === 0 ? "Tags (e.g. vlog, cooking, disneyland)" : ""} 
                            />
                        </div>
                    </div>
                    <div className="upload_create-room_right">
                        <div className="upload_create-room_select">
                            {(v => v[0].toUpperCase()+v.substr(1))(newStack.get('privacyStatus'))}
                            <Icon type="arrow-drop-down" />
                            <select value={newStack.get('privacyStatus')} onChange={this.handleStatusChange}>
                                <option value="public">Public</option>
                                <option value="unlisted">Unlisted</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect()(CreateRoom);
