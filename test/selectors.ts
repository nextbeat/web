import { Map, List, fromJS } from 'immutable'
import { createSelector } from 'reselect'
import createCachedSelector from 're-reselect'

export type State = Map<string, any>

function StateModelFactory<Props>(
    keyMap: {[key in keyof Props]: string[]}, 
    keyMapPrefix: string[],
    entityName?: string
) {

    class StateModel {
        static get<K extends keyof Props>(state: State, key: K, defaultValue?: Props[K]): Props[K] {
            return state.getIn(this.keyPath(key), defaultValue)
        }

        // static getEntity(state: State, id: string): State | null {
        //     if (!entityName) {
        //         return null
        //     }
        //     return state.getIn(['entities', entityName, id]) || null
        // }

        static getEntity = createSelector(
            (state: State) => {
                let id = StateModel.get(state, 'id' as keyof Props) as any as number
                return state.getIn(['entities', entityName as string, id.toString()]) as State
            },
            (entity) => ({ entity: entity }) // todo: entity class wrapper
        )

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


// Section

interface SectionProps {
    isFetching: boolean
    name: string
}

let sectionKeyMap = {
    // meta
    'isFetching': ['meta', 'isFetching'],
    'name': ['meta', 'name'],
}

let sectionKeyMapPrefix = ['pages', 'section']

class Section extends StateModelFactory<SectionProps>(sectionKeyMap, sectionKeyMapPrefix) {
    
    static getPrettyName = createSelector(
        (state: State) => Section.get(state, 'name'),
        (name) => ({ name: `~${name}~` })
    )

}


// Room

interface RoomProps {
    title: string,
    commentIds: List<number>
}

let roomKeyMap: {[key in keyof RoomProps]: string[]} = {
    'title': ['title'],
    'commentIds': ['pagination', 'comments', 'ids']
}

class Room {

    static getComments = createCachedSelector(
        (state: State, id: number) => Room.get(state, id, 'commentIds', List()) as List<number>,
        (ids) => ids.map(id => ({ comment: state.getIn(['entities', 'comments', id.toString()]).toJS() }) )
    )(
        (state, id) => `${id}-${Room.get(state, id, 'commentIds', List()).size}`
    )

    protected static keyPath(id: number, key: keyof RoomProps): string[] {
        return ['rooms', id.toString()].concat(roomKeyMap[key])
    }

    static get<K extends keyof RoomProps>(state: State, id: number, key: K, defaultValue?: RoomProps[K]): RoomProps[K] {
        return state.getIn(this.keyPath(id, key), defaultValue)
    }

}

// Test

let state = fromJS({
    entities: {
        comments: {
            '1': {
                message: 'foo'
            },
            '2': {
                message: 'bar'
            },
            '3': {
                message: 'qux'
            },
            '4': {
                message: 'abc'
            }
        }
    },
    rooms: {
        '1': {
            title: 'New Room',
            pagination: {
                comments: {
                    ids: [1, 2]
                }
            }
        },
        '2': {
            pagination: {
                comments: {
                    ids: [3, 4]
                }
            }
        }
    },
    pages: {
        section: {
            meta: {
                isFetching: false,
                name: 'featured'
            }
        }
    }
})

console.log(Section.get(state, 'name'), Section.getPrettyName(state))

let c1 = Room.getComments(state, 1)
let c2 = Room.getComments(state, 2)
let c1b = Room.getComments(state, 1)

console.log(Room.get(state, 1, 'title'), c1 === c2, c1 === c1b)

interface Type<T> {
    new (...args: any[]): T;
}

/* static interface declaration */
interface ComparableStatic<T> extends Type<Comparable<T>> {
    compare(a: T, b: T): number;
}

/* interface declaration */
interface Comparable<T> {
    compare(a: T): number;
}

/* class decorator */
function staticImplements<T>() {
    return (constructor: T) => {}
}

@staticImplements<ComparableStatic<TableCell>>()   /* this statement implements both normal interface & static interface */
class TableCell { /* implements Comparable<TableCell> { */  /* not required. become optional */
    value: number;

    compare(a: TableCell): number {
        return this.value - a.value;
    }

    static compare(a: TableCell, b: TableCell): number {
        return a.value - b.value;
    }
}
