import editProfile from './editProfile'
import community from './community'
import stats from './stats'
import { combineReducers } from '@reducers/utils'

export default combineReducers({
    editProfile,
    community,
    stats
})
