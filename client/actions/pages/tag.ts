import assign from 'lodash-es/assign'
import { Map, fromJS } from 'immutable'

import { 
    ActionType, 
    ApiCallAction,
    ApiCancelAction,
    ThunkAction,
    Pagination 
} from '@actions/types'
import * as Schemas from '@schemas'
import Tag from '@models/state/pages/tag'
import { loadPaginatedObjects } from '@actions/utils'

export type TagActionAll =
    TagAction |
    TagStacksAction |
    ClearTagStacksAction |
    ClearTagAction
     
/**********
 * FETCHING
 **********/

export interface TagAction extends ApiCallAction {
    type: ActionType.TAG
}
export function loadTag(name: string): TagAction {
    return {
        type: ActionType.TAG,
        API_CALL: {
            schema: Schemas.Tag,
            endpoint: `tags/${name}`
        }
    }
}

export interface TagFilterOptions {
    status: 'open' | 'closed' | 'all'
    time: 'all' | 'month' | 'week'
    sort: string
}
export interface TagStacksAction extends ApiCallAction {
    type: ActionType.TAG_STACKS
    options: Partial<TagFilterOptions>
}
function fetchStacksForTag(tagName: string, options: Partial<TagFilterOptions>, pagination: Pagination): TagStacksAction {
    return {
        type: ActionType.TAG_STACKS,
        options,
        API_CALL: {
            schema: Schemas.Stacks,
            endpoint: "stacks",
            queries: assign({}, options, { tags: tagName }),
            pagination
        }
    }
}

export interface ClearTagStacksAction extends ApiCancelAction {
    type: ActionType.CLEAR_TAG_STACKS
}
function clearStacksForTag(): ClearTagStacksAction {
    return {
        type: ActionType.CLEAR_TAG_STACKS,
        API_CANCEL: {
            actionTypes: [ActionType.TAG_STACKS]
        }
    }
}

export function loadStacksForTag(name: string, options: Partial<TagFilterOptions> = {}): ThunkAction {
    return (dispatch, getState) => {
        const filters = Tag.get(getState(), 'filters')
        let optionsMap = filters.merge(fromJS(options));
        if (!optionsMap.equals(filters)) {
            dispatch(clearStacksForTag())
        }
        loadPaginatedObjects(['pages', 'tag', 'pagination', 'stacks'], fetchStacksForTag.bind(this, name, optionsMap.toJS()), 24)(dispatch, getState)
    }

}

/*******
 * RESET
 *******/

export interface ClearTagAction extends ApiCancelAction {
    type: ActionType.CLEAR_TAG
}
export function clearTag(): ClearTagAction {
    return {
        type: ActionType.CLEAR_TAG,
        API_CANCEL: {
            actionTypes: [ActionType.TAG_STACKS, ActionType.TAG]
        }
    }
}
