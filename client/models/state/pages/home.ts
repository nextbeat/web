import { List, Map } from 'immutable'

import Stack from '@models/entities/stack'
import { StateModelFactory } from '@models/state/base'
import { createSelector, createKeyedSelector } from '@models/utils'
import { State } from '@types'

interface HomeProps {
    sectionsFetching: boolean
    sectionsError: boolean
    sections: List<any>

    mainCardId: number
}

const keyMap = {
    // sections
    'sectionsFetching': ['isFetching'],
    'sectionsError': ['error'],
    'sections': ['sections'],
    // main card
    'mainCardId': ['mainCardId']
}

const keyMapPrefix = ['pages', 'home']

export default class Home extends StateModelFactory<HomeProps>(keyMap, keyMapPrefix) {

    static stacks = createKeyedSelector(
        (state: State, index: number) => {
            const stackIds = Home.get(state, 'sections', List()).get(index, Map()).get('stacks', List()) as List<number>
            return stackIds.map(id => new Stack(id, state.get('entities')))
        }
    )(
        (state: State, index: number) => Home.get(state, 'sections', List()).get(index, Map()).get('stacks'),
        (state: State, index: number) => index
    )
        

    static mainCardStack = createSelector(
        (state: State) => new Stack(Home.get(state, 'mainCardId'), state.get('entities'))
    )(
        (state: State) => state.getIn(['entities', 'stacks', Home.get(state, 'mainCardId').toString()])
    )

    static isLoaded(state: State) {
        return this.get(state, 'sections', List()).size > 0
    }

}