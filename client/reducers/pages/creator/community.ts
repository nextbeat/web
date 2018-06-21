import moderators from './community/moderators'
import emojis from './community/emojis'
import shop from './community/shop'
import { combineReducers } from '@reducers/utils'

export default combineReducers({
    moderators,
    emojis,
    shop
})