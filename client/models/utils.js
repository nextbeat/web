export function memoize(fn, hashFn, hashKeyFn) {
    let lastResult = null
    let hashes = {}

    function result(...args) {
        let hashKey = hashKeyFn(...args)
        let hash = hashFn(...args)
        if (hashes[hashKey] !== hash) {     
            lastResult = fn(...args)
        }
        hashes[hashKey] = hash
        return lastResult 
    }

    function flush() {
        hashes = {}
    }

    return {
        get: result,
        flush
    }
}
