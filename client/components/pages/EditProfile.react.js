import React from 'react'
import { connect } from 'react-redux'

import EditCoverImage from './edit/EditCoverImage.react'
import EditCoverImageModal from './edit/EditCoverImageModal.react'
import EditProfilePicture from './edit/EditProfilePicture.react'
import EditProfilePictureModal from './edit/EditProfilePictureModal.react'
import Spinner from '../shared/Spinner.react'

import { CurrentUser, App, Upload } from '../../models'
import { UploadTypes, triggerAuthError, updateUser, clearEditProfile, clearFileUpload } from '../../actions'

class EditProfile extends React.Component {

    constructor(props) {
        super(props)

        this.updateState = this.updateState.bind(this)
        this.clearState = this.clearState.bind(this)

        this.handleFullNameChange = this.handleFullNameChange.bind(this)
        this.handleWebsiteChange = this.handleWebsiteChange.bind(this)
        this.handleBioChange = this.handleBioChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

        this.state = {
            fullName: '',
            website: '',
            bio: ''
        }
    }


    // Component lifecycle

    componentDidMount() {
        if (this.props.currentUser.get('hasUpdatedEntity')) {
            this.updateState(this.props)
        } 
    }   

    componentWillReceiveProps(nextProps) {
        if (!this.props.currentUser.get('hasUpdatedEntity') && nextProps.currentUser.get('hasUpdatedEntity')) {
            this.updateState(nextProps)
        }

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

    updateState(props) {
        const { currentUser } = props
        this.setState({
            fullName: currentUser.get('full_name'),
            website: currentUser.get('website_url'),
            bio: currentUser.get('description')
        })
    }

    clearState() {
        this.setState({
            fullName: '',
            website: '',
            bio: ''
        })
    }


    // Event handlers


    handleFullNameChange(e) {
        this.setState({ fullName: e.target.value.substring(0, 50) })
    }

    handleWebsiteChange(e) {
        this.setState({ website: e.target.value.substring(0, 100) })
    }

    handleBioChange(e) {        
        this.setState({ bio: e.target.value.substring(0, 120) })
    }

    handleSubmit() {
        const { dispatch, upload } = this.props 

        let userObj = {
            full_name: this.state.fullName,
            website_url: this.state.website,
            description: this.state.bio
        }

        // add profile picture if it's been updated
        if (upload.isDoneUploading(UploadTypes.PROFILE_PICTURE)) {
            userObj['profile_picture'] = {
                url: upload.get(UploadTypes.PROFILE_PICTURE, 'url')
            }
        }

        // add cover image under similar conditions
        if (upload.isDoneUploading(UploadTypes.COVER_IMAGE)) {
            userObj['cover_image'] = {
                url: upload.get(UploadTypes.COVER_IMAGE, 'url')
            }
        }

        this.props.dispatch(updateUser(userObj))
    }

    // Render

    render() {
        const { app, currentUser } = this.props 
        const { fullName, website, bio } = this.state

        return (
            <div className="edit-profile content">
                <EditProfilePictureModal />
                <EditCoverImageModal />
                <div className="content_inner">
                    <div className="content_header">
                        Edit Profile
                    </div>
                    <EditCoverImage />
                    <div className="edit-profile_user">
                        <EditProfilePicture />
                        <div className="edit-profile_username">{currentUser.get('username')}</div>
                    </div>
                    <div className="edit-profile_form">
                        <div className="edit-profile_form-item">
                            <label>Full Name</label><input type="text" onChange={this.handleFullNameChange} value={fullName} />
                        </div>
                        <div className="edit-profile_form-item">
                            <label>Website</label><input type="text" onChange={this.handleWebsiteChange} value={website} />
                        </div>
                        <div className="edit-profile_form-item">
                            <label>Bio</label><textarea onChange={this.handleBioChange} value={bio} />
                        </div>
                        <div className="edit-profile_separator"></div>
                        <div className="edit-profile_submit">
                            <div className="edit-profile_submit-btn"><a className="btn" onClick={this.handleSubmit}>Submit</a></div>
                            <div className="edit-profile_submit-result">
                                { currentUser.get('isUpdatingUser') && <Spinner type="grey small" /> } 
                                { currentUser.get('hasUpdatedUser') && "Changes saved." }
                                { currentUser.get('updateUserError') && <div className="error">{currentUser.get('updateUserError')}</div> }
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
        upload: new Upload(state)
    }
}

export default connect(mapStateToProps)(EditProfile);
