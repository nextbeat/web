import { List } from 'immutable'

import { StateModelFactory } from '@models/state/base'
import User from '@models/entities/user'
import { createEntityListSelector } from '@models/utils'
import { State } from '@types'

interface CommunityProps {
    isFetchingModerators: boolean
    hasFetchedModerators: boolean
    moderatorsError: string
    moderatorIds: List<number>

    isAddingModerator: boolean
    addModeratorError: string

    isRemovingModerator: boolean
    removeModeratorError: string
}

const keyMap = {
    'isFetchingModerators': ['isFetchingModerators'],
    'hasFetchedModerators': ['hasFetchedModerators'],
    'moderatorsError': ['moderatorsError'],
    'moderatorIds': ['ids'],

    'isAddingModerator': ['isAddingModerator'],
    'addModeratorError': ['addModeratorError'],

    'isRemovingModerator': ['isRemovingModerator'],
    'removeModeratorError': ['removeModeratorError']
}

const keyMapPrefix = ['pages', 'creator', 'community']

export default class Community extends StateModelFactory<CommunityProps>(keyMap, keyMapPrefix) {

    static moderators = createEntityListSelector(Community, 'moderatorIds', User)

}