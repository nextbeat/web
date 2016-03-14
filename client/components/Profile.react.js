import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'

import StackItem from './shared/StackItem.react'
import User from './shared/User.react'

import { loadProfile, clearProfile, loadStacksForUser } from '../actions'
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
                <User user={profile.entity()} style={"large"} />
                <div className="profile_header">OPEN</div>
                <div className="profile_rooms">
                    { openStacks.map(stack => <StackItem key={stack.get('id')} stack={stack} />)}
                </div>
                <div className="profile_header">HISTORY</div>
                <div className="profile_rooms">
                    { closedStacks.map(stack => <StackItem key={stack.get('id')} stack={stack} />)}
                </div>
            </section>
        )
    }

    render() {
        const { isFetching, error, profile } = this.props;
        return (
            <div className="profile content">
                { isFetching && <span>Profile is loading...</span> }
                { error && error.length > 0 && <span>{error}</span> }
                { profile.get('id') && this.renderProfile() }
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

export default connect(mapStateToProps)(ProfileComponent);
