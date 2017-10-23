import { List } from 'immutable'

import { StateModelFactory } from '@models/state/base'
import { createEntityListSelector } from '@models/utils'
import User from '@models/entities/user'
import Stack from '@models/entities/stack'

export type SearchType = 'tags' | 'users' | 'stacks'

interface SearchProps {
    query: string
    searchType: SearchType

    userIds: List<number>
    usersFetching: boolean
    usersError: string
    tagIds: List<number>
    tagsFetching: boolean
    tagsError: string
    stackIds: List<number>
    stacksFetching: boolean
    stacksError: string
}

const keyMap = {
    // meta
    'query': ['meta', 'query'],
    'searchType': ['meta', 'searchType'],
    // pagination
    'userIds': ['pagination', 'users', 'ids'],
    'usersFetching': ['pagination', 'users', 'isFetching'],
    'usersError': ['pagination', 'users', 'error'],
    'tagIds': ['pagination', 'tags', 'ids'],
    'tagsFetching': ['pagination', 'tags', 'isFetching'],
    'tagsError': ['pagination', 'tags', 'error'],
    'stackIds': ['pagination', 'stacks', 'ids'],
    'stacksFetching': ['pagination', 'stacks', 'isFetching'],
    'stacksError': ['pagination', 'stacks', 'error']
}

const keyMapPrefix = ['pages', 'search']

export default class Search extends StateModelFactory<SearchProps>(keyMap, keyMapPrefix) {

    static users = createEntityListSelector(Search, 'userIds', User)

    static stacks = createEntityListSelector(Search, 'stackIds', Stack)

    static tags = createEntityListSelector(Search, 'tagIds', 'tags')

}