import assign from 'lodash-es/assign'
import { List } from 'immutable'

import { State } from '@types'
import { EntityModel } from '@models/entities/base'

/**
 * Key Maps/Props
 */

export interface EntityProps {
    id: number
    isFetching: boolean
    error: string
}

const entityKeyMap = {
    'id': ['meta', 'id'],
    'isFetching': ['meta', 'boolean'],
    'error': ['meta', 'error']
}

export function withEntityMap(keyMap: any): any {
    return assign({}, entityKeyMap, keyMap)
}

/**
 * Selectors
 */

type Selector<R> = (state: State, ...args: any[]) => R
type Resolver<R> = (state: State, ...args: any[]) => R

type OutputSelector<R> = (hashResolver: Resolver<any>) => Selector<R>
type KeyedOutputSelector<R> = (hashResolver: Resolver<any>, keyResolver: Resolver<string|number>) => KeyedOutputSelectorResult<R>

type KeyedOutputSelectorResult<R> = Selector<R> & {
    removeKey: (state: State, ...args: any[]) => void
}

export function createKeyedSelector<R>(func: Selector<R>): KeyedOutputSelector<R> {

    return (hashResolver: Resolver<any>, keyResolver: Resolver<string|number>) => {

        let hashes: any = {}
        let results: any = {}

        let selector = function memoize(state: State, ...args: any[]): R {
            let key = keyResolver(state, ...args)
            let hash = hashResolver(state, ...args)
            if (typeof hash === 'undefined') {
                // Need to store some kind of value in hashes
                hash = null
            }
            if (hashes[key] !== hash) {
                results[key] = func(state, ...args)
            }
            hashes[key] = hash
            return results[key] as R 
        } as KeyedOutputSelectorResult<R>

        selector.removeKey = (state: State, ...args: any[]) => {
            let key = keyResolver(state, ...args)
            delete hashes[key]
            delete results[key]
        }

        return selector 
    }
    
}

export function createSelector<R>(func: Selector<R>): OutputSelector<R> {

      return (hashResolver: Resolver<any>) => {

          let lastHash: any;
          let lastResult: R;

          let selector = function memoize(state: State, ...args: any[]): R {
              let hash = hashResolver(state, ...args)
              if (typeof hash === 'undefined') {
                  hash = null
              }
              if (hash !== lastHash) {
                  lastResult = func(state, ...args)
              }
              hash = lastHash
              return lastResult as R
          }

          return selector
      }
}

export function createEntityListSelector(modelClass: any, idKey: string, entityClass: typeof EntityModel | string): Selector<List<any>> {
    return createSelector(
        (state: State) => {
            let ids = modelClass.get(state, idKey, List()) as List<number>
            if (typeof entityClass === 'string') {
                // Get entity object directly, without class wrapper
                return ids.map(id => state.getIn(['entities', entityClass, id.toString()]))
            } else {
                return ids.map(id => new entityClass(id, state.get('entities')))
            }
        }
    )(
        (state: State) => modelClass.get(state, idKey)
    )
}

