import { List } from 'immutable'

import { StateModelFactory } from '@models/state/base'
import StatsUser from '@models/entities/statsUser'
import StatsStack from '@models/entities/statsStack'
import { withEntityMap,  createSelector } from '@models/utils'
import { State } from '@types'

interface StatsProps {
    userId: number
    userIsFetching: boolean
    userHasFetched: boolean
    userError: string

    roomId: number
    roomIsFetching: boolean
    roomHasFetched: boolean
    roomError: string
}

const keyMap = withEntityMap({
    'userId': ['user', 'id'],
    'userIsFetching': ['user', 'isFetching'],
    'userHasFetched': ['user', 'hasFetched'],
    'userError': ['user', 'error'],

    'roomId': ['room', 'id'],
    'roomIsFetching': ['room', 'isFetching'],
    'roomHasFetched': ['room', 'hasFetched'],
    'roomError': ['room', 'error']
})

const keyMapPrefix = ['pages', 'creator', 'stats']

export default class Stats extends StateModelFactory<StatsProps>(keyMap, keyMapPrefix) {

    static user = createSelector(
        (state: State) => new StatsUser(Stats.get(state, 'userId'), state.get('entities'))
    )(
        (state: State) => Stats.get(state, 'userId')
    )

    static room = createSelector(
        (state: State) => new StatsStack(Stats.get(state, 'roomId'), state.get('entities'))
    )(
        (state: State) => Stats.get(state, 'roomId')
    )

}