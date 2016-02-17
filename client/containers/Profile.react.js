import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { Map, List } from 'immutable'

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
        if (prevProps.params.stack_id !== this.props.params.stack_id) {
            this.props.dispatch(clearProfile())
            this.props.dispatch(loadProfile(this.props.params.username))
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.profile.get('id') !== this.props.profile.get('id')) {
            // profile has loaded
            this.props.dispatch(loadStacksForUser(this.props.params.username));
        }
    }

    renderProfile() {
        const { profile, stacks } = this.props;
        const profpic_url = profile.get('profpic_thumbnail_url') || profile.get('profpic_url');
        return (
            <section>  
                <section className="user">
                    <div className="profile-picture"><img src={profpic_url} /></div>
                    {profile.get('username')}
                </section>
                { stacks.map(stack => <div><Link to={`/r/${stack.get('id')}`}>{stack.get('id')}: {stack.get('description')}</Link></div>)}
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
    const id = state.getIn(['profile', 'id'], 0);
    const isFetching = state.getIn(['profile', 'isFetching']);
    const error = state.getIn(['profile', 'error']);

    const profile = getEntity(state, 'users', id);
    const stacks = getPaginatedEntities(state, 'stacks');

    return {
        isFetching,
        error,
        profile,
        stacks
    }
}

export default connect(mapStateToProps)(Profile);
