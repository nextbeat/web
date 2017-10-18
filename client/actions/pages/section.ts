import { ActionType, Action, ThunkAction, Pagination } from '@actions/types'
import * as Schema from '@schemas'
import { loadPaginatedObjects } from '@actions/utils'
import { Section } from '@models'

/**********
 * FETCHING
 **********/

function fetchSection(slug: string, pagination: Pagination): Action {
    return {
        type: ActionType.Section,
        slug,
        API_CALL: {
            schema: Schema.Stacks,
            endpoint: `home/${slug}`,
            pagination
        }
    }
}

export function loadSection(slug: string): ThunkAction {
    return (dispatch, getState) => {
        if (!slug) {
            const section = new Section(getState())
            slug = section.get('slug')
        }
        loadPaginatedObjects(['pages', 'section', 'pagination', 'stacks'], fetchSection.bind(this, slug))(dispatch, getState)
    }
}

/*******
 * RESET
 *******/

export function clearSection(slug): Action {
    return {
        type: ActionType.ClearSection,
        slug,
        API_CANCEL: {
            actionTypes: [ActionType.Section]
        }
    }
}