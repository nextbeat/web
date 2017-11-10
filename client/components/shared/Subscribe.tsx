import * as React from 'react'
import { connect } from 'react-redux'

import CurrentUser from '@models/state/currentUser'
import User from '@models/entities/user'
import { subscribe, unsubscribe } from '@actions/user'
import { State, DispatchProps } from '@types'

interface OwnProps {
    user: User
}

interface ConnectProps {
    isSubscribed: boolean
}

interface SubscribeState {
    hover: boolean
}

type AllProps = OwnProps & ConnectProps & DispatchProps

class Subscribe extends React.Component<AllProps, SubscribeState> {

    constructor(props: AllProps) {
        super(props);

        this.handleSubscribe = this.handleSubscribe.bind(this);
        this.handleUnsubscribe = this.handleUnsubscribe.bind(this);
        this.renderSubscribed = this.renderSubscribed.bind(this);
        this.renderUnsubscribed = this.renderUnsubscribed.bind(this);

        this.state = {
            hover: false
        }
    }

    handleSubscribe() {
        const { dispatch, user } = this.props
        dispatch(subscribe(user))
    }

    handleUnsubscribe() {
        const { dispatch, user } = this.props 
        dispatch(unsubscribe(user))
    }

    renderSubscribed() {
        return <a className="btn btn-light btn-inactive" onClick={this.handleUnsubscribe}>{ this.state.hover ? "Unsubscribe" : "Subscribed" }</a>
    }

    renderUnsubscribed() {
        return <a className="btn btn-light" onClick={this.handleSubscribe}>Subscribe</a>
    }

    render() {
        const { isSubscribed, user } = this.props;
        return (
            <div className="user_subscribe" onMouseOver={() => this.setState({hover: true})} onMouseOut={() => this.setState({hover: false})}>
                <div className="btn-subscribe">
                    { isSubscribed? this.renderSubscribed() : this.renderUnsubscribed()}
                    <div className="btn-subscribe_count">{user.get('subscriber_count')}</div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        isSubscribed: CurrentUser.isSubscribed(state, ownProps.user.get('id'))
    }
}

export default connect(mapStateToProps)(Subscribe);
