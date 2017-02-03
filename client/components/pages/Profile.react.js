import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import ScrollComponent from '../utils/ScrollComponent.react'

import LargeStackItem from '../shared/LargeStackItem.react'
import ProfileHeader from './profile/ProfileHeader.react'
import RoomCard from '../room/RoomCard.react'
import Spinner from '../shared/Spinner.react'
import PageError from '../shared/PageError.react'
import AppBanner from '../shared/AppBanner.react'

import { loadProfile, clearProfile, loadStacksForUser } from '../../actions'
import { Profile, App, CurrentUser } from '../../models'
import { baseUrl } from '../../utils'

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

        if (prevProps.currentUser.isLoggedIn() !== this.props.currentUser.isLoggedIn()
            && [prevProps.currentUser.get('username', ''), this.props.currentUser.get('username', '')].indexOf(this.props.params.username) !== -1) {
            // we want to reload on log out to hide/show any unlisted rooms belonging to the user 
            this.props.dispatch(clearProfile())
            this.props.dispatch(loadProfile(this.props.params.username))
        }
    }

    renderDocumentHead(profile) {
        let description = ''
        let creator = profile.get('full_name') ? `${profile.get('full_name')} (@${profile.get('username')})` : profile.get('username')

        if (profile.get('description')) {
            description = profile.get('description')
        } else {
            description = `See rooms made on Nextbeat by ${creator})`
        }

        let meta = [
            {"property": "al:ios:url", "content": `nextbeat://users/${profile.get('username')}`},
            {"property": "og:title", "content": `${creator} - Nextbeat`},
            {"property": "og:description", "content": description},
            {"property": "og:url", "content": `${baseUrl()}/u/${profile.get('username')}`},
            {"name": "description", "content": description}
        ]

        if (profile.thumbnail().get('url')) {
            meta.push({"property": "og:image", "content": profile.thumbnail().get('url')})
        }

        return  (
            <Helmet 
                title={creator} 
                meta={meta}
            />
        );
    }

    renderProfile() {
        const { profile, app, currentUser } = this.props
        let stacks = profile.stacks()

        let openStacks = stacks.filter(s => !s.get('closed'))
        let closedStacks = stacks.filter(s => s.get('closed'))

        let shouldDisplayNoContent = stacks.size === 0 && profile.get('stacksHasFetched', false)

        return (
            <section>  
                { this.renderDocumentHead(profile) }
                <ProfileHeader user={profile.entity()} />
                <div className="content_inner">
                    { openStacks.size > 0 && 
                        <div>
                            <div className="rooms-list_header">OPEN</div>
                            <div className="rooms-list_rooms">
                                { openStacks.map(stack => <LargeStackItem key={stack.get('id')} stack={stack} />)}
                            </div>
                        </div>
                    }
                    { closedStacks.size > 0 && 
                        <div>
                            <div className="rooms-list_header">PREVIOUS</div>
                            <div className="rooms-list_rooms">
                                { closedStacks.map(stack => <LargeStackItem key={stack.get('id')} stack={stack} />)}
                            </div>
                        </div>
                    }

                    { profile.get('stacksFetching') && <Spinner type="grey rooms-list" /> }
                    { shouldDisplayNoContent && 
                        <div className="profile_no-content">There's nothing here.</div>
                    }
                </div>
            </section>
        )
    }

    render() {
        const {  profile } = this.props;
        return (
            <div className="profile content" id="profile">
                <AppBanner url={`nextbeat://users/${profile.get('username')}`} />
                { profile.get('error') && (profile.get('error').length > 0) && <PageError>User not found.</PageError> }
                { profile.get('id') !== 0 && this.renderProfile() }
            </div>
        );
    }
}

function mapStateToProps(state, props) {
    return {
        profile: new Profile(state),
        app: new App(state),
        currentUser: new CurrentUser(state)
    }
}

const scrollOptions = {

     onScrollToBottom: function() {
        const { profile, dispatch } = this.props 
        if (!profile.get('stacksFetching') && profile.stacks().size > 0) {
            dispatch(loadStacksForUser())
        }
     }  
}

ProfileComponent.fetchData = (store, params) => {
    return new Promise((resolve, reject) => {

        const unsubscribe = store.subscribe(() => {
            const profile = new Profile(store.getState())
            if (profile.isLoaded()) {
                unsubscribe()
                resolve(store)
            }
            if (profile.get('error')) {
                unsubscribe()
                reject(new Error('Profile does not exist.'))
            }
        })
        store.dispatch(loadProfile(params.username))
    })
}

export default connect(mapStateToProps)(ScrollComponent('profile', scrollOptions)(ProfileComponent));
