import { keys } from 'lodash'
import moment from 'moment'

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
            if (expires && moment(expires).isBefore()) {
                localStorage.removeItem(key)
            }
        })
    }

}