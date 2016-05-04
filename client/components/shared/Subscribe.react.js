import React from 'react'
import { connect } from 'react-redux'

import { CurrentUser } from '../../models'
import { subscribe, unsubscribe } from '../../actions'

class Subscribe extends React.Component {

    constructor(props) {
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
        return <a className="btn btn-light btn-secondary btn-inactive" onClick={this.handleUnsubscribe}>{ this.state.hover ? "Unsubscribe" : "Subscribed" }</a>
    }

    renderUnsubscribed() {
        return <a className="btn btn-light btn-secondary" onClick={this.handleSubscribe}>Subscribe</a>
    }

    render() {
        const { currentUser, user } = this.props;
        return (
            <div className="user_subscribe" onMouseOver={() => this.setState({hover: true})} onMouseOut={() => this.setState({hover: false})}>
            { currentUser.isSubscribed(user.get('id')) ? this.renderSubscribed() : this.renderUnsubscribed()}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: new CurrentUser(state) 
    }
}

export default connect(mapStateToProps)(Subscribe);
