import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { Map } from 'immutable'

import EditCoverImage from './edit/EditCoverImage.react'
import EditCoverImageModal from './edit/EditCoverImageModal.react'
import EditProfilePicture from './edit/EditProfilePicture.react'
import EditProfilePictureModal from './edit/EditProfilePictureModal.react'
import Spinner from '../shared/Spinner.react'
import Icon from '../shared/Icon.react'

import { CurrentUser, App, Upload, EditProfile as EditProfileModel } from '../../models'
import { UploadTypes, triggerAuthError, loadEditProfile, updateEditProfile, submitEditProfile, clearEditProfile, clearFileUpload } from '../../actions'

class EditProfile extends React.Component {

    constructor(props) {
        super(props)

        this.handleBackClick = this.handleBackClick.bind(this)
        this.handleFullNameChange = this.handleFullNameChange.bind(this)
        this.handleWebsiteChange = this.handleWebsiteChange.bind(this)
        this.handleBioChange = this.handleBioChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }


    // Component lifecycle

    componentDidMount() {
        this.props.dispatch(loadEditProfile())
    }   

    componentWillReceiveProps(nextProps) {
        if (!this.props.currentUser.isLoggedIn() && !this.props.currentUser.get('isLoggingIn') && !this.props.app.hasAuthError()) {
            this.props.dispatch(triggerAuthError())
            this.clearState()
        }
    }

    componentWillUnmount() {
        this.props.dispatch(clearEditProfile())
        this.props.dispatch(clearFileUpload(UploadTypes.PROFILE_PICTURE))
        this.props.dispatch(clearFileUpload(UploadTypes.COVER_IMAGE))
    }

    // Event handlers

    handleBackClick() {
        const { currentUser } = this.props
        browserHistory.push(`/u/${currentUser.get('username')}`)
    }   

    handleFullNameChange(e) {
        this.props.dispatch(updateEditProfile({ fullName: e.target.value.substring(0, 50) }))
    }

    handleWebsiteChange(e) {
        this.props.dispatch(updateEditProfile({ website: e.target.value.substring(0, 100) }))
    }

    handleBioChange(e) {        
        this.props.dispatch(updateEditProfile({ bio: e.target.value.substring(0, 120) }))
    }

    handleSubmit() {
        const { dispatch, editProfile } = this.props
        if (editProfile.get('hasChanged')) {
            dispatch(submitEditProfile())
        }
    }

    // Render

    render() {
        const { editProfile, currentUser } = this.props 

        let profileFields = editProfile.get('fields', Map())
        let shouldDisableSubmit = !editProfile.get('hasChanged')

        return (
            <div className="edit edit-profile content">
                <EditProfilePictureModal />
                <EditCoverImageModal />
                <div className="content_inner">
                    <div className="content_header">
                        <div className="content_back" onClick={this.handleBackClick}><Icon type="arrow-back" /></div> Edit Profile
                    </div>
                    <EditCoverImage />
                    <div className="edit-profile_user">
                        <EditProfilePicture />
                        <div className="edit-profile_username">{currentUser.get('username')}</div>
                    </div>
                    <div className="edit_form">
                        <div className="edit_form-item">
                            <label>Full Name</label><input type="text" onChange={this.handleFullNameChange} value={profileFields.get('fullName', '')} />
                        </div>
                        <div className="edit_form-item">
                            <label>Website</label><input type="text" onChange={this.handleWebsiteChange} value={profileFields.get('website', '')} />
                        </div>
                        <div className="edit_form-item">
                            <label>Bio</label><textarea onChange={this.handleBioChange} value={profileFields.get('bio', '')} />
                        </div>
                        <div className="edit_separator"></div>
                        <div className="edit_submit">
                            <div className="edit_submit-btn"><a className={`btn ${shouldDisableSubmit ? 'btn-gray btn-disabled' : ''}`} onClick={this.handleSubmit}>Submit</a></div>
                            <div className="edit_submit-result">
                                { editProfile.get('isUpdatingUser') && <Spinner type="grey small" /> } 
                                { editProfile.get('hasUpdatedUser') && "Changes saved." }
                                { editProfile.get('updateUserError') && <div className="error">{editProfile.get('updateUserError')}</div> }
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        app: new App(state),
        currentUser: new CurrentUser(state),
        upload: new Upload(state),
        editProfile: new EditProfileModel(state)
    }
}

export default connect(mapStateToProps)(EditProfile);
