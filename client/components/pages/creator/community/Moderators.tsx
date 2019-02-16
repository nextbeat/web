import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import Spinner from '@components/shared/Spinner'

import { loadModerators } from '@actions/pages/creator/community'
import { mod, unmod } from '@actions/user'
import CurrentUser from '@models/state/currentUser'
import CommunityModel from '@models/state/pages/creator/community'
import User from '@models/entities/user'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    currentUserId: number

    isFetching: boolean
    hasFetched: boolean
    error?: string
    moderators: List<User>

    isAdding: boolean
    addError?: string

    isRemoving: boolean
    removeError?: string
}

interface ComponentState {
    username: string
}

type Props = ConnectProps & DispatchProps

class Moderators extends React.Component<Props, ComponentState> {

    constructor(props: Props) {
        super(props)

        this.handleRemoveClick = this.handleRemoveClick.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

        this.renderUser = this.renderUser.bind(this)

        this.state = {
            username: ''
        }
    }

    componentDidMount() {
        this.props.dispatch(loadModerators())
    }

    componentDidUpdate(prevProps: Props) {
        const { isAdding, isRemoving, addError, removeError, dispatch } = this.props

        if ((prevProps.isAdding && !isAdding && !addError)
            || (prevProps.isRemoving && !isRemoving && !removeError)) 
        {
            dispatch(loadModerators())
        }
    }

    handleRemoveClick(username: string) {
        const { dispatch, currentUserId } = this.props
        dispatch(unmod(currentUserId, username))
    }

    handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        const { dispatch } = this.props;
        if (e.charCode === 13) { // enter
            this.handleSubmit(e)
        }
    }

    handleChange(e: React.FormEvent<HTMLInputElement>) {
        this.setState({ username: e.currentTarget.value })
    }

    handleSubmit(e: React.FormEvent<HTMLInputElement>) {
        const { dispatch, currentUserId } = this.props
        const { username } = this.state
        if (username && username.trim().length > 0) {
            dispatch(mod(currentUserId, username.trim()))
            this.setState({ username: '' })
        }
    }

    renderUser(user: User) {
        return (
            <div className="community_box_element" key={user.get('id')}>
                <div 
                    className="community_box_element_thumbnail community_box_element_thumbnail-user" 
                    style={{backgroundImage: `url(${user.thumbnail('small').get('url')})`}}
                />
                <div className="community_box_element_text">{ user.get('username') }</div>
                <div className="community_box_element_remove" onClick={this.handleRemoveClick.bind(this, user.get('username'))}>Remove</div>
            </div>
        )
    }

    render() {
        const { isFetching, isAdding, isRemoving, 
                error, addError, removeError, moderators } = this.props
        const { username } = this.state

        const isProcessing = isFetching || isAdding || isRemoving
        
        return (
            <div className="community_box community_box-moderators">
                <div className="community_box_list">
                    { isProcessing && <Spinner styles={["grey"]} /> }
                    { !isProcessing && moderators.map(mod => this.renderUser(mod)) }
                </div>
                <div className="community_box_submit_container">
                    { addError && <div className="community_box_submit_error">Error adding user. Please try again.</div> }
                    <div className="community_box_submit_fields">
                        <input 
                            placeholder="Add a moderator"
                            className="community_box_input"
                            onKeyPress={this.handleKeyPress} 
                            onChange={this.handleChange}
                            value={username}
                        />
                        <input type="submit" 
                            className="community_box_submit"
                            value="Add" 
                            disabled={username.trim().length === 0} 
                            onClick={this.handleSubmit} 
                        />
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        currentUserId: CurrentUser.get(state, 'id'),

        isFetching: CommunityModel.get(state, 'isFetchingModerators'),
        hasFetched: CommunityModel.get(state, 'hasFetchedModerators'),
        error: CommunityModel.get(state, 'moderatorsError'),
        moderators: CommunityModel.moderators(state),

        isAdding: CommunityModel.get(state, 'isAddingModerator'),
        addError: CommunityModel.get(state, 'addModeratorError'),
        
        isRemoving: CommunityModel.get(state, 'isRemovingModerator'),
        removeError: CommunityModel.get(state, 'removeModeratorError')
    }
}

export default connect(mapStateToProps)(Moderators)