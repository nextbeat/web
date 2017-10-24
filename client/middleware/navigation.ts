import debounce from 'lodash-es/debounce'
import assign from 'lodash-es/assign'
import { ActionType, Action } from '@actions/types'
import { markStack } from '@actions/room'
import CurrentUser from '@models/state/currentUser'
import RoomPage from '@models/state/pages/room'
import MediaItem from '@models/entities/mediaItem'
import { Store, Dispatch } from '@types'

let markStackFn = debounce((store, next, action) => {
    store.dispatch(markStack(action.roomId, action.lastRead))
}, 1000)

export default (store: Store) => (next: Dispatch) => (action: Action) => {
    
    const state = store.getState()    

    if (action.type === ActionType.SELECT_MEDIA_ITEM) 
    {
        /* Calculate number of media items in the range between the
         * last seen media item and the currently selected media item.
         * Decrement the unreadCount accordingly.
         */
        let lastReadDate = RoomPage.get(state, 'lastRead')
        let selectedMediaItem = new MediaItem(action.id, store.getState().get('entities'))
        let selectedMediaItemDate = new Date(selectedMediaItem.get('user_created_at'))

        if (lastReadDate < selectedMediaItemDate) 
        {
            let numSeenSinceLastSeen = RoomPage.allMediaItems(state).filter(mediaItem => {
                let mediaItemDate = new Date(mediaItem.get('user_created_at'))
                return mediaItemDate > lastReadDate && mediaItemDate <= selectedMediaItemDate;
            }).size 

            assign(action, {
                unreadCount: Math.max(RoomPage.get(state, 'unreadCount') - numSeenSinceLastSeen, 0),
                lastRead: selectedMediaItemDate
            })

            if (CurrentUser.isLoggedIn(state)) 
            {
                // User has read a new media item; we notify the server,
                // but we debounce so that we don't overwhelm the server
                // if the user is navigating quickly through items
                markStackFn(store, next, action);
            }
        }

        next(action)
    } 
    else if (action.type === ActionType.RECEIVE_ROOM_MARKED) {
        // Ignore if the locally stored unread count 
        // is greater than or equal to the one received
        if (action.unreadCount < RoomPage.get(state, 'unreadCount'))
        {
            // Calculate last read based on the new unread count
            let lastReadMediaItem = RoomPage.allMediaItems(state).reverse().get(action.unreadCount)
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