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
    keyMapPrefix: string[],
    entityName?: string
) {

    class StateModel {
        static get<K extends keyof Props>(state: State, key: K, defaultValue?: Props[K]): Props[K] {
            return state.getIn(this.keyPath(key), defaultValue)
        }

        static has<K extends keyof Props>(state: State, key: K): boolean {
            return state.hasIn(this.keyPath(key))
        }

        static getEntity(state: State): State | null {
            let id = this.get(state, 'id' as keyof Props)
            if (!id) {
                return null
            }
            return state.getIn(['entities', entityName as string, id.toString()]) as State
        }

        protected static keyPath(key: keyof Props): string[] {
            let path = keyMap[key]
            if (keyMapPrefix.length > 0) {
                path = keyMapPrefix.concat(path)
            }
            return path
        }
    }

    return StateModel
}
