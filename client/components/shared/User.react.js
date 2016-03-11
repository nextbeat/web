import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Icon from './Icon.react'

import { subscribe, unsubscribe } from '../../actions'

class User extends React.Component {

    constructor(props) {
        super(props)

        this.handleSubscribe = this.handleSubscribe.bind(this);
    }

    handleSubscribe(e) {
        const { user, dispatch } = this.props
        e.preventDefault(e)
        dispatch(subscribe(user))
    }

    render() {
        const { user, style } = this.props;
        const profpic_url = user.get('profpic_thumbnail_url') || user.get('profpic_url');
        const styleClass = style ? `user-${style}` : "";
        return (
            <div className={`user ${styleClass}`}>
            <Link to={`/u/${user.get('username')}`}><div className="user_profpic">{ profpic_url ? <img src={profpic_url} /> : <Icon type="person" /> }</div></Link>
                <Link to={`/u/${user.get('username')}`}><span className="user_username">{ user.get('username') }</span></Link>
                <a className="btn btn-light user_subscribe" onClick={this.handleSubscribe}>Subscribe</a>
            </div>
        );
    }
}

function mapStateToProps(state) {
    // we just need props.dispatch
    return {}
}

export default connect(mapStateToProps)(User);
