import company from './company'
import creator from './creator'
import editRoom from './editRoom'
import home from './home'
import partner from './partner'
import profile from './profile'
import room from './room'
import search from './search'
import section from './section'
import support from './support'
import tag from './tag'
import { combineReducers } from '@reducers/utils'

export default combineReducers({
    company,
    creator,
    editRoom,
    home,
    partner,
    profile,
    room,
    search,
    section,
    support,
    tag
})
