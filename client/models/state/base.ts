import has from 'lodash-es/has'
import { Map, List } from 'immutable'
import { createSelector } from 'reselect'
import { entityClass } from '@models/entities/base'

export type State = Map<string, any>

/**
 * Base model class, used to access data in the state tree
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

        static getEntity(state: State): State | null {
            let id = this.get(state, 'id' as keyof Props)
            if (!id) {
                return null
            }
            return state.getIn(['entities', entityName as string, id.toString()]) as State
        }

        // static getPaginatedEntities(state: State, key: string): List<State> | null {
        //     const keyPath = keyMapPrefix.concat(['pagination', key, 'ids'])
        //     const ids = state.getIn(keyPath, List()) as List<number>
        //     return ids.map(id => {
        //         // todo: static getEntity for pagination key
        //         return this.getEntity(state, id.toString()) as State
        //     })
        // }

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


// export class StateModel<Props> {    
//     readonly keyMap: {[key in keyof Props]: string[]}
//     readonly keyMapPrefix: string[]
//     readonly entityName?: string

//     constructor(public state: State) {}

//     get<K extends keyof Props>(key: K, defaultValue?: Props[K]): Props[K] {
//         return this.state.getIn(this.keyPath(key), defaultValue)
//     }

//     has(key: string) {
//         return this.state.hasIn(this.keyPath(key as keyof Props))
//     }

//     protected keyPath(key: keyof Props): string[] {
//         let path = this.keyMap[key]
//         if (this.keyMapPrefix.length > 0) {
//             path = this.keyMapPrefix.concat(path)
//         }
//         return path
//     }

//     entity(): State | null {
//         if (!this.has('id')) {
//             return null
//         }
//         return this.getEntity(this.get('id' as keyof Props)+"")
//     }

//     protected getEntity(id: string): State | null {
//         if (!this.entityName) {
//             return null
//         }
//         return this.state.getIn(['entities', this.entityName, id]) || null
//     }

//     protected getPaginatedEntities(key: string): List<State> | null {
//         const keyPath = this.keyMapPrefix.concat(['pagination', key, 'ids'])
//         const ids = this.state.getIn(keyPath, List()) as List<number>
//         return ids.map(id => {
//             // todo: static getEntity for pagination key
//             return this.getEntity(id.toString()) as State
//         })
//     }
// }





// export default class StateModelOld {

//     constructor(state) {
//         this.state = state;
//         this.keyMap = {};
//         this.keyMapPrefix = [];
//         this.entityName = "base";
//     }

//     keyPath(key) {
//         if (!has(this.keyMap, key)) {
//             return null
//         }
//         let path = this.keyMap[key]
//         if (this.keyMapPrefix.length > 0) {
//             path = this.keyMapPrefix.concat(path)
//         }
//         return path
//     }

//     get(key, defaultValue) {
//         if (!this.keyPath(key)) {
//             // if not defined in the key map, check the entity
//             if (!this.entity().has(key)) {
//                 return defaultValue;
//             } else {
//                 return this.entity().get(key, defaultValue);
//             }
//         }
//         // console.log(this.keyPath(key))
//         return this.state.getIn(this.keyPath(key), defaultValue);
//     }

//     has(key) {
//         if (!this.keyPath(key)) {
//             return this.entity().has(key);
//         }
//         return this.state.hasIn(this.keyPath(key));
//     }

//     entity() {
//         return has(this.keyMap, 'id') ? this.__getEntity(this.get('id')) : Map();
//     }

//     isLoaded() {
//         return this.get('id', 0) !== 0;
//     }

//     __getEntity(id, entityName) {
//         entityName = entityName || this.entityName;
//         if (typeof id === "number") {
//             id = id.toString();
//         }
//         return this.state.getIn(['entities', entityName, id], Map());
//     }

//     __getPaginatedEntities(key, { paginatedEntityKey, entityClass } = {}) {
//         let keyPath = this.keyMapPrefix.concat(['pagination', key, 'ids'])
//         return this.state.getIn(keyPath, List())
//             .map(id => {
//                 if (entityClass) {
//                     // Same as calling new <entityClass>()
//                     let entity = Object.create(entityClass.prototype);
//                     entityClass.call(entity, id, this.state.get('entities'))
//                     return entity
//                 } else {
//                     paginatedEntityKey = paginatedEntityKey || key;
//                     return this.__getEntity(id, paginatedEntityKey)
//                 }
//             });
//     }

//     static getEntity(state, id) {
//         let model = new this(state)
//         return model.__getEntity(id)
//     }
// }
