import { List } from 'immutable'

import { StateModelFactory } from '@models/state/base'
import { EntityProps, withEntityMap, createEntityListSelector, createSelector } from '@models/utils'
import { State } from '@types'

interface PartnerProps extends EntityProps {
   
}

const keyMap = withEntityMap({

})

const keyMapPrefix = ['pages', 'profile']

export default class Partner extends StateModelFactory<PartnerProps>(keyMap, keyMapPrefix) {

}