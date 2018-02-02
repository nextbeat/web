import assign from 'lodash-es/assign'
import get from 'lodash-es/get'
import pickBy from 'lodash-es/pickBy'
import { parse } from 'querystring'
import * as fetch from 'isomorphic-fetch'

import { AnalyticsEventType, Action, AnalyticsCall } from '@actions/types'
import { Dimensions } from '@analytics/definitions'
import { createFunctionWithTimeout } from '@utils'
import { Dispatch, Store } from '@types'

/**
 * Middleware which handles Google Analytics session tracking.
 * Custom first-party analytics is handled in a separate 
 * function in analytics.js.
 */

const CAMPAIGN_MAP: any = {
    'e1': {
        'campaignName': 'july16_followup',
        'campaignSource': 'nextbeat',
        'campaignMedium': 'email'
    },
    'e2': {
        'campaignName': 'july16_forceful_outreach',
        'campaignSource': 'nextbeat',
        'campaignMedium': 'email'
    },
    'e3': {
        'campaignName': 'july16_outreach',
        'campaignSource': 'nextbeat',
        'campaignMedium': 'email'
    },
    'e4': {
        'campaignName': 'aug16_vlogreachout',
        'campaignSource': 'nextbeat',
        'campaignMedium': 'email',
    },
    'e5': {
        'campaignName': 'feb17_outreach',
        'campaignSource': 'nextbeat',
        'campaignMedium': 'email'
    },
    'es': {
        'campaignName': 'email_subscription',
        'campaignSource': 'nextbeat',
        'campaignMedium': 'email'
    },
    'pw': {
        'campaignName': 'web_push',
        'campaignSource': 'nextbeat',
        'campaignMedium': 'push'
    },
    'ps': {
        'campaignName': 'safari_push',
        'campaignSource': 'nextbeat',
        'campaignMedium': 'push'
    }
}

function parseQuery(queryString: string) {
    // search query string for campaign-related parameters
    const source = get(parse(queryString), 's', '') as string
    if (source in CAMPAIGN_MAP) {
        let fields = CAMPAIGN_MAP[source]
        // set campaign-related parameters
        for (let field in fields) {
            ga('set', field, fields[field])
        }
    }
    
}

function handleIdentify(data: AnalyticsCall) {
    const gaid = data.gaid
    ga('set', 'userId', gaid)
    ga('set', Dimensions.USER_ID, gaid)
}

function handlePage(data: AnalyticsCall) {
    ga('set', 'page', document.location.pathname)

    if (document.location.search.length > 0) {
        parseQuery(document.location.search.substring(1))
    }

    ga('send', 'pageview')
}

function handleEvent(data: AnalyticsCall) {
    let eventData: any = {
        eventCategory: data.category,
        eventAction: data.action,
        eventLabel: data.label,
        transport: 'beacon'
    }

    // assign any custom dimensions or metrics in data object
    assign(eventData, pickBy(data, (_, key) => /(dimension|metric)\d+/.test(key)))

    if (data.callback) {
        eventData.hitCallback = createFunctionWithTimeout(data.callback);
    }

    ga('send', 'event', eventData)
}

export default (store: Store) => (next: Dispatch) => (action: Action) => {

    const data = action.GA as AnalyticsCall
    if (typeof data === 'undefined' || typeof window === 'undefined') {
        return next(action)
    }

    // send the action without the GA attribute
    let newAction = assign({}, action)
    delete newAction.GA
    next(newAction);

    // trigger the analytics call based on the type
    switch (data.type) {
        case 'event':
            return handleEvent(data)
        case 'page':
            return handlePage(data)
        case 'identify':
            return handleIdentify(data)
    }
}