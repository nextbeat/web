import home from './home'
import profile from './profile'
import room from './room'
import search from './search'
import section from './section'
import support from './support'
import tag from './tag'
import upload from './upload'
import { combineReducers } from './utils'

export default combineReducers({
    home,
    profile,
    room,
    search,
    section,
    support,
    tag,
    upload
})
