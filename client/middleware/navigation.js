import debounce from 'lodash/debounce'
import assign from 'lodash/assign'
import { ActionTypes, markStack } from '../actions'
import { CurrentUser, RoomPage, MediaItemEntity } from '../models'

let markStackFn = debounce((store, next, action) => {
    store.dispatch(markStack(action.roomId, action.lastRead))
}, 1000)

export default store => next => action => {

    if (action.type === ActionTypes.SELECT_MEDIA_ITEM) 
    {
        const currentUser = new CurrentUser(store.getState())
        const roomPage = new RoomPage(store.getState())

        /* Calculate number of media items in the range between the
         * last seen media item and the currently selected media item.
         * Decrement the unreadCount accordingly.
         */
        let lastReadDate = roomPage.get('lastRead')
        let selectedMediaItem = new MediaItemEntity(action.id, store.getState().get('entities'))
        let selectedMediaItemDate = new Date(selectedMediaItem.get('user_created_at'))

        if (lastReadDate < selectedMediaItemDate) 
        {
            let numSeenSinceLastSeen = roomPage.allMediaItems().filter(mediaItem => {
                let mediaItemDate = new Date(mediaItem.get('user_created_at'))
                return mediaItemDate > lastReadDate && mediaItemDate <= selectedMediaItemDate;
            }).size 

            assign(action, {
                unreadCount: Math.max(roomPage.get('unreadCount') - numSeenSinceLastSeen, 0),
                lastRead: selectedMediaItemDate
            })

            if (currentUser.isLoggedIn()) 
            {
                // User has read a new media item; we notify the server,
                // but we debounce so that we don't overwhelm the server
                // if the user is navigating quickly through items
                markStackFn(store, next, action);
            }
        }

        next(action)
    } 
    else if (action.type === ActionTypes.RECEIVE_ROOM_MARKED)
    {
        const roomPage = new RoomPage(store.getState())

        // Ignore if the locally stored unread count 
        // is greater than or equal to the one received
        if (action.unreadCount < roomPage.get('unreadCount'))
        {
            // Calculate last read based on the new unread count
            let lastReadMediaItem = roomPage.allMediaItems().reverse().get(action.unreadCount)
            if (lastReadMediaItem)
            {
                next(assign(action, {
                    lastRead: new Date(lastReadMediaItem.get('user_created_at'))
                }))
            }
        }
    }
    else
    {
        next(action);
    }


}