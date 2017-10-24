import keys from 'lodash-es/keys'
import * as isBefore from 'date-fns/is_before'

import { storageAvailable, getStorageItemExpiration } from '@utils'
import { ActionType, Action } from '@actions/types'
import { Store, Dispatch } from '@types'

export default (store: Store) => (next: Dispatch) => (action: Action) => {

    // send action through in all cases
    next(action)

    if (action.type === ActionType.CLEAN_CACHE) {
        // Clears expired items in local storage
        if (!storageAvailable('localStorage')) {
            return;
        }

        let storageKeys = keys(localStorage)
        storageKeys.forEach((key: string) => {
            var expires = getStorageItemExpiration(key)
            if (expires && isBefore(expires, new Date())) {
                localStorage.removeItem(key)
            }
        })
    }

}