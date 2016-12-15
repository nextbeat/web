import keys from 'lodash/keys'
import isBefore from 'date-fns/is_before'

import { storageAvailable, getStorageItemExpiration } from '../utils'
import { ActionTypes } from '../actions'

export default store => next => action => {

    // send action through in all cases
    next(action)

    if (action.type === ActionTypes.CLEAN_CACHE) {
        // Clears expired items in local storage
        if (!storageAvailable('localStorage')) {
            return;
        }

        let storageKeys = keys(localStorage)
        storageKeys.forEach(key => {
            var expires = getStorageItemExpiration(key)
            if (expires && isBefore(expires, new Date())) {
                localStorage.removeItem(key)
            }
        })
    }

}