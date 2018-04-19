import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { List } from 'immutable'
import * as format from 'date-fns/format'

import Spinner from '@components/shared/Spinner'

import { loadStats } from '@actions/pages/creator/stats'
import StatsModel from '@models/state/pages/creator/stats'
import StatsUser from '@models/entities/statsUser'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    isFetching: boolean
    hasFetched: boolean
    error: string
    stats: StatsUser
}

type Props = ConnectProps & DispatchProps 

class StatsComponent extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        this.props.dispatch(loadStats())
    }

    // todo: reload on new user

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
    console.log(StatsModel.get(state, 'userHasFetched'), StatsModel.user(state))
    return {
        isFetching: StatsModel.get(state, 'userIsFetching'),
        hasFetched: StatsModel.get(state, 'userHasFetched'),
        error: StatsModel.get(state, 'userError'),
        stats: StatsModel.user(state)
    }
}

export default connect(mapStateToProps)(StatsComponent)