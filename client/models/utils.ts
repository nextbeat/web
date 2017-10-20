import { State } from '@types'

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
              if (hash !== lastHash) {
                  lastResult = func(state, ...args)
              }
              hash = lastHash
              return lastResult as R
          }

          return selector
      }

}