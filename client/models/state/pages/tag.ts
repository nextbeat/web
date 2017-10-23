import { List, Map } from 'immutable'

import { State } from '@types'
import { createPaginationSelector, EntityProps, withEntityMap } from '@models/utils'
import { StateModelFactory } from '@models/state/base'
import Stack from '@models/entities/stack'

interface TagFilters {
    sort: string
    status: string
    time: string
}

interface TagProps extends EntityProps {
    stackIds: List<number>
    stacksFetching: boolean
    stacksError: string

    filters: Map<keyof TagFilters, any>
    sort: string
    status: string
    time: string
}

const keyMap = withEntityMap({
    // stacks
    'stackIds': ['pagination', 'stacks', 'ids'],
    'stacksFetching': ['pagination', 'stacks', 'isFetching'],
    'stacksError': ['pagination', 'stacks', 'error'],
    // filters
    'filters': ['filters'],
    'sort': ['filters', 'sort'],
    'status': ['filters', 'status'],
    'time': ['filters', 'time']
})

const keyMapPrefix = ['pages', 'tag']

export default class Tag extends StateModelFactory<TagProps>(keyMap, keyMapPrefix) {

    static stacks = createPaginationSelector(Tag, 'stackIds', Stack)

}