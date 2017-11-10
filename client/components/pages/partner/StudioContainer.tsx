import * as React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import CurrentUser from '@models/state/currentUser'
import { State } from '@types'

interface Props {
    isLoggedIn: boolean
}

class StudioContainer extends React.Component<Props> {

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.isLoggedIn && !nextProps.isLoggedIn) {
            browserHistory.push('/');
        }
    }

    render() {
        return (
            <div className="studio">
                { this.props.children }
            </div>
        )
    }
}

function mapStateToProps(state: State): Props {
    return {
        isLoggedIn: CurrentUser.isLoggedIn(state)
    }
}

export default connect(mapStateToProps)(StudioContainer)