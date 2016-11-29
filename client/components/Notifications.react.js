import React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import { Notifications as NotificationsModel } from '../models'
import { loadNotifications, clearNotifications } from '../actions'
import Spinner from './shared/Spinner.react' 
import NotificationItem from './notifications/NotificationItem.react'

class Notifications extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.dispatch(loadNotifications())
    }

    componentWillUnmount() {
        this.props.dispatch(clearNotifications())
    }

    render() {
        const { notifications } = this.props 

        return (
            <div className="notifications content" id="notifications">
                { notifications.get('isFetching') && <Spinner type="grey" /> }
                <div className="notifications_list">
                    { notifications.get('allNotifications', List()).map(notification => 
                        <NotificationItem notification={notification} />
                    )}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        notifications: new NotificationsModel(state)
    }
}

export default connect(mapStateToProps)(Notifications)