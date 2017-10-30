import { Map, List } from 'immutable'
import { createSelector } from 'reselect'
import { entityClass } from '@models/entities/base'

import { State } from '@types'

/**
 * Base model class factory, used to access data in the state tree
 * so that the organization of the state tree is abstracted
 * away in other files.
 */
export function StateModelFactory<Props>(
    keyMap: {[key in keyof Props]: string[]}, 
    keyMapPrefix: string[]
) {

    class StateModel {
        static get<K extends keyof Props>(state: State, key: K, defaultValue?: Props[K]): Props[K] {
            return state.getIn(this.keyPath(key), defaultValue)
        }

        static has<K extends keyof Props>(state: State, key: K): boolean {
            return state.hasIn(this.keyPath(key))
        }

        protected static keyPath(key: keyof Props): string[] {
            let path = keyMap[key]
            if (keyMapPrefix.length > 0) {
                path = keyMapPrefix.concat(path)
            }
            return path
        }

        static isLoaded(state: State): boolean {
            return state.getIn(this.keyPath('id' as any)) > 0
        }
    }

    return StateModel
}
