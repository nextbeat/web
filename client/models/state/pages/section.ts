import { List, Map } from 'immutable'

import { State } from '@types'
import { createEntityListSelector, EntityProps, withEntityMap } from '@models/utils'
import { StateModelFactory } from '@models/state/base'
import Stack from '@models/entities/stack'

interface SectionProps extends EntityProps {
    name: string
    slug: string
    description: string

    stacksFetching: string
    stacksError: string
    stackIds: List<number>
}

const keyMap = withEntityMap({
    // meta
    'name': ['meta', 'name'],
    'slug': ['meta', 'slug'],
    'description': ['meta', 'description'],
    // stacks
    'stacksFetching': ['pagination', 'stacks', 'isFetching'],
    'stacksError': ['pagination', 'stacks', 'error'],
    'stackIds': ['pagination', 'stacks', 'ids']
})

const keyMapPrefix = ['pages', 'section']

export default class Section extends StateModelFactory<SectionProps>(keyMap, keyMapPrefix) {

    static stacks = createEntityListSelector(Section, 'stackIds', Stack)

    static isLoaded(state: State): boolean {
        return !!this.get(state, 'name')
    }

}
