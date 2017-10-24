import editProfile from './editProfile'
import editRoom from './editRoom'
import home from './home'
import profile from './profile'
import room from './room'
import search from './search'
import section from './section'
import support from './support'
import tag from './tag'
import { combineReducers } from '@reducers/utils'

export default combineReducers({
    editRoom,
    editProfile,
    home,
    profile,
    room,
    search,
    section,
    support,
    tag
})
