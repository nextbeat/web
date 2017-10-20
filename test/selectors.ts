import { Map, List, fromJS } from 'immutable'

export type State = Map<string, any>


type Selector<R> = (state: State, ...args: any[]) => R
type Resolver<R> = (state: State, ...args: any[]) => R

type OutputSelector<R> = (keyResolver: Resolver<string|number>, hashResolver: Resolver<any>) => OutputSelectorResult<R>

type OutputSelectorResult<R> = Selector<R> & {
    removeKey: (state: State, ...args: any[]) => void
}

export function createSelector<R>(func: Selector<R>): OutputSelector<R> {

    return (keyResolver: Resolver<string|number>, hashResolver: Resolver<any>) => {

        let hashes: any = {}
        let results: any = {}

        let selector = function memoize(state: State, ...args: any[]): R {
            let key = keyResolver(state, ...args)
            let hash = hashResolver(state, ...args)
            console.log(key, hash, hashes, results)
            if (hashes[key] !== hash) {
                results[key] = func(state, ...args)
            }
            hashes[key] = hash
            return results[key] as R 
        } as OutputSelectorResult<R>

        selector.removeKey = (state: State, ...args: any[]) => {
            let key = keyResolver(state, ...args)
            delete hashes[key]
            delete results[key]
        }

        return selector 
    }
    
}

let state = fromJS({
    foo: 1,
    bar: {
        qux: 'hello'
    }
})

const selector = createSelector(
    state => ({ bar: `~~${state.getIn(['bar', 'qux'])}~~` })
)(
    state => state.get('foo') as number,
    state => state.get('bar')
)

let s1 = selector(state)

console.log(s1)

let s2 = selector(state)

console.log(s2 === s1)

state = state.set('foo', 2)
let s3 = selector(state)
console.log(s3 === s1)

state = state.set('foo', 1)
let s4 = selector(state)
console.log(s4 === s1)

state = state.setIn(['bar', 'qux'], 'goodbye')
let s5 = selector(state)
console.log(s5, s5 === s1)



