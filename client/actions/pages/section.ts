import { 
    ActionType, 
    GenericAction, 
    ApiCallAction,
    ApiCancelAction,
    ThunkAction, 
    ApiCall,
    ApiCancel,
    Pagination
} from '@actions/types'
import * as Schema from '@schemas'
import { loadPaginatedObjects } from '@actions/utils'
import Section from '@models/state/pages/section'

export type SectionActionAll = 
    SectionAction |
    ClearSectionAction

/**********
 * FETCHING
 **********/

export interface SectionAction extends ApiCallAction {
    type: ActionType.SECTION
    slug: string
}
function fetchSection(slug: string, pagination: Pagination): SectionAction {
    return {
        type: ActionType.SECTION,
        slug,
        API_CALL: {
            schema: Schema.Stacks,
            endpoint: `home/${slug}`,
            pagination
        }
    }
}

export function loadSection(slug?: string): ThunkAction {
    return (dispatch, getState) => {
        if (!slug) {
            slug = Section.get(getState(), 'slug')
        }
        loadPaginatedObjects(['pages', 'section', 'pagination', 'stacks'], fetchSection.bind(this, slug))(dispatch, getState)
    }
}

/*******
 * RESET
 *******/

export interface ClearSectionAction extends ApiCancelAction {
    type: ActionType.CLEAR_SECTION
    slug: string
}
export function clearSection(slug: string): ClearSectionAction {
    return {
        type: ActionType.CLEAR_SECTION,
        slug,
        API_CANCEL: {
            actionTypes: [ActionType.SECTION]
        }
    }
}