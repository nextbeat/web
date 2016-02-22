import { Map } from 'immutable';

// todo: api server should handle stack_id inputs
// todo: return nextUrl in api server?
export function loadPaginatedObjects(modelKey, objectKey, action, defaultLimit=20) {
    return (dispatch, getState) => {

        const { 
            page = 0, 
            limit = defaultLimit, 
            total = -1,
            beforeDate = Date.now(),
            ids = []
        } = getState().getIn([modelKey, 'pagination', objectKey], Map()).toJS()

        if (total >= 0 && total <= ids.length) {
            // reached the end of the list of objects
            return null;
        }

        const pagination = {
            page: page+1,
            limit,
            beforeDate
        };

        return dispatch(action(pagination));
    }
}