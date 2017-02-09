export function memoize(fn, hashFn, hashKeyFn) {
    let lastResult = null
    let hashes = {}
    return (...args) => {
        let hashKey = hashKeyFn(...args)
        let hash = hashFn(...args)
        if (hashes[hashKey] !== hash) {     
            lastResult = fn(...args)
        }
        hashes[hashKey] = hash
        return lastResult 
    }
}