import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { Map, List } from 'immutable'

import StackItem from '../components/StackItem.react'

import { loadProfile, clearProfile, loadStacksForUser } from '../actions'
import { getEntity, getPaginatedEntities } from '../utils'

class Profile extends React.Component {

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
        if (prevProps.params.user_id !== this.props.params.user_id) {
            this.props.dispatch(clearProfile())
            this.props.dispatch(loadProfile(this.props.params.username))
        }
    }

    renderProfile() {
        const { profile, openStacks, closedStacks } = this.props;
        const profpic_url = profile.get('profpic_thumbnail_url') || profile.get('profpic_url');
        return (
            <section>  
                <section className="user">
                    <div className="profile-picture"><img src={profpic_url} /></div>
                    {profile.get('username')}
                </section>
                <div className="header">OPEN</div>
                { openStacks.map(stack => <Link key={stack.get('id')} to={`/r/${stack.get('id')}`}><StackItem stack={stack} /></Link>)}
                <div className="header">HISTORY</div>
                { closedStacks.map(stack => <Link key={stack.get('id')} to={`/r/${stack.get('id')}`}><StackItem stack={stack} /></Link>)}
            </section>
        )
    }

    render() {
        const { isFetching, error, profile } = this.props;
        return (
            <div id="profile">
                { isFetching && <span>Profile is loading...</span> }
                { error && error.length > 0 && <span>{error}</span> }
                { profile.get('id') && this.renderProfile() }
            </div>
        );
    }
}

function mapStateToProps(state, props) {
    const { id=0, isFetching, error } = state.getIn(['profile', 'meta'], Map()).toJS()

    const profile = getEntity(state, 'users', id);
    const openStacks = getPaginatedEntities(state, 'profile', 'openStacks', 'stacks');
    const closedStacks = getPaginatedEntities(state, 'profile', 'closedStacks', 'stacks');

    return {
        isFetching,
        error,
        profile,
        openStacks,
        closedStacks
    }
}

export default connect(mapStateToProps)(Profile);
