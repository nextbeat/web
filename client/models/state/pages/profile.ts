import { List } from 'immutable'

import { StateModelFactory } from '@models/state/base'
import { EntityProps, withEntityMap, createEntityListSelector } from '@models/utils'
import UserEntity from '@models/entities/user'
import StackEntity from '@models/entities/stack'
import { State } from '@types'

interface ProfileProps extends EntityProps {
    stackIds: List<number>
    stacksFetching: boolean
    stacksHasFetched: boolean
    stacksError: string
}

const keyMap = withEntityMap({
    'stackIds': ['pagination', 'stacks', 'ids'],
    'stacksFetching': ['pagination', 'stacks', 'isFetching'],
    'stacksHasFetched': ['pagination', 'stacks', 'hasFetched'],
    'stacksError': ['pagination', 'stacks', 'error']
})

const keyMapPrefix = ['pages', 'profile']

export default class Profile extends StateModelFactory<ProfileProps>(keyMap, keyMapPrefix) {

    static entity(state: State) {
        return new UserEntity(this.get(state, 'id'), state.get('entities'))
    }

    static thumbnail(state: State) {
        return this.entity(state).thumbnail('medium')
    }

    static stack = createEntityListSelector(Profile, 'stackIds', StackEntity)

}