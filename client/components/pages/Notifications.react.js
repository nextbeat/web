import React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import { Notifications as NotificationsModel } from '../../models'
import { loadActivity, clearNotifications } from '../../actions'
import Spinner from '../shared/Spinner.react' 
import NotificationItem from './notifications/NotificationItem.react'

class Notifications extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.dispatch(loadActivity())
    }

    componentWillUnmount() {
        this.props.dispatch(clearNotifications())
    }

    render() {
        const { activity, isFetching } = this.props 

        return (
            <div className="notifications content" id="notifications">
                <div className="content_inner">
                    { isFetching && <Spinner type="grey" /> }
                    { !isFetching &&
                        <div className="notifications_list">
                            { activity.map((notification, idx) => 
                                <NotificationItem key={idx} notification={notification} />
                            )}
                            { activity.size === 0 &&
                                <div className="notifications_not-found">
                                    Check back later to see notifications about people you've subscribed to and rooms you've bookmarked.
                                </div>
                            }
                        </div>
                    }
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const notifications = new NotificationsModel(state)
    return {
        activity: notifications.activity(),
        isFetching: notifications.get('isFetching')
    }
}

export default connect(mapStateToProps)(Notifications)