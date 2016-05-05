import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import ScrollComponent from './utils/ScrollComponent.react'

import LargeStackItem from './shared/LargeStackItem.react'
import User from './shared/User.react'
import Spinner from './shared/Spinner.react'
import PageError from './shared/PageError.react'

import { loadProfile, clearProfile, loadClosedStacksForUser } from '../actions'
import { Profile } from '../models'

class ProfileComponent extends React.Component {

    constructor(props) {
        super(props);

        this.renderProfile = this.renderProfile.bind(this);
    }

    componentDidMount() {
        const { params: { username }, dispatch } = this.props
        dispatch(loadProfile(username));
    }

    componentWillUnmount() {
        this.props.dispatch(clearProfile());
    }

    componentDidUpdate(prevProps) {
        if (prevProps.params.username !== this.props.params.username) {
            this.props.dispatch(clearProfile())
            this.props.dispatch(loadProfile(this.props.params.username))
        }
    }

    renderProfile() {
        const { profile, openStacks, closedStacks } = this.props;
        const profpic_url = profile.get('profpic_thumbnail_url') || profile.get('profpic_url');
        return (
            <section>  
                <Helmet title={profile.get('username')} />
                <div className="profile_user-container"><User user={profile.entity()} style={"large"} /></div>

                { openStacks.size > 0 && 
                <div>
                    <div className="rooms-list_header">OPEN</div>
                    <div className="rooms-list_rooms">
                        { openStacks.map(stack => <LargeStackItem key={stack.get('id')} stack={stack} />)}
                    </div>
                </div>
                }

                { /* Show no-content history only if the user has no open stacks */ }
                { (closedStacks.size > 0 || (openStacks.size === 0 && !profile.stacksFetching())) && 
                <div>
                    <div className="rooms-list_header">HISTORY</div>
                    <div className="rooms-list_rooms">
                        { closedStacks.size === 0 && !profile.stacksFetching() && <div className="profile_no-content">{profile.get('username')} has not made any rooms!</div> }
                        { closedStacks.map(stack => <LargeStackItem key={stack.get('id')} stack={stack} />)}
                    </div>
                </div>
                }

                { profile.stacksFetching() && <Spinner type="grey rooms-list" /> }
            </section>
        )
    }

    render() {
        const { isFetching, error, profile } = this.props;
        return (
            <div className="profile content" id="profile">
                { isFetching && <Spinner type="grey large profile" /> }
                { error && (error.length > 0) && <PageError>User not found.</PageError> }
                { profile.get('id') !== 0 && this.renderProfile() }
            </div>
        );
    }
}

function mapStateToProps(state, props) {
    const profile = new Profile(state)

    return {
        isFetching: profile.get('isFetching'),
        error: profile.get('error'),
        profile: profile,
        openStacks: profile.openStacks(),
        closedStacks: profile.closedStacks()
    }
}

const scrollOptions = {

     onScrollToBottom: function() {
        const { profile, dispatch, closedStacks } = this.props 
        if (!profile.stacksFetching() && closedStacks.size > 0) {
            dispatch(loadClosedStacksForUser())
        }
     }  
}

export default connect(mapStateToProps)(ScrollComponent('profile', scrollOptions)(ProfileComponent));
