import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { List } from 'immutable'
import * as format from 'date-fns/format'

import Spinner from '@components/shared/Spinner'

import { loadRoomStats } from '@actions/pages/creator/stats'
import Stats from '@models/state/pages/creator/stats'
import StatsStack from '@models/entities/statsStack'
import { State, DispatchProps, RouteProps } from '@types'

interface ConnectProps {
    isFetching: boolean
    hasFetched: boolean
    error: string
    stats: StatsStack
}

interface Params {
    hid: string
}

type Props = ConnectProps & DispatchProps & RouteProps<Params>

class StatsRoom extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        const { dispatch, params } = this.props
        dispatch(loadRoomStats(params.hid))
    }
    
    render() {
        const { stats, isFetching, hasFetched, error } = this.props
        return (
            <div>
                { hasFetched && 
                    <div />
                }
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isFetching: Stats.get(state, 'userIsFetching'),
        hasFetched: Stats.get(state, 'userHasFetched'),
        error: Stats.get(state, 'userError'),
        stats: Stats.room(state)
    }
}

export default connect(mapStateToProps)(StatsRoom)