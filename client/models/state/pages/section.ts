import { List, Map } from 'immutable'
import { createSelector } from 'reselect'
import createCachedSelector from 're-reselect'

import { StateModelFactory, State } from '../base'
import Stack from '@models/entities/stack'

// todo: merge in common props?
interface SectionProps {
    isFetching: boolean
    error: string
    name: string
    slug: string
    description: string

    stacksFetching: string
    stacksError: string
    stackIds: List<Stack>
}

// todo: merge in common keys?
const keyMap = {
    // meta
    'isFetching': ['meta', 'isFetching'],
    'error': ['meta', 'error'],
    'name': ['meta', 'name'],
    'slug': ['meta', 'slug'],
    'description': ['meta', 'description'],
    // stacks
    'stacksFetching': ['pagination', 'stacks', 'isFetching'],
    'stacksError': ['pagination', 'stacks', 'error'],
    'stackIds': ['pagination', 'stacks', 'ids']
}

const keyMapPrefix = ['pages', 'section']

export default class Section extends StateModelFactory<SectionProps>(keyMap, keyMapPrefix) {

    static stacks = createCachedSelector(
        (state: State) => Section.get(state, 'stackIds'),
        (state: State) => state.get('entities'),
        (ids, entities) => ids.map(id => new Stack(id, entities))
    )(
        (ids, entities) => ids.map(id => id.toString()).join('_')
    )

    static isLoaded(state: State): boolean {
        return !!this.get(state, 'name')
    }

}
