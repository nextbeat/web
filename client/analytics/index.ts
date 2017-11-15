/** 
 * Source: Phil Walton, 2017
 * https://philipwalton.com/articles/the-google-analytics-setup-i-use-on-every-site-i-build/
 */

import forOwn from 'lodash-es/forOwn'

import { Dimensions, Metrics, getDefinitionIndex } from './definitions'
import { generateUuid } from '../utils'

import 'autotrack/lib/plugins/page-visibility-tracker'
import 'autotrack/lib/plugins/clean-url-tracker'

/**
 * Bump this when making backwards incompatible changes to the tracking
 * implementation. This allows you to create a segment or view filter
 * that isolates only data captured with the most recent tracking changes.
 */
const TRACKING_VERSION = '3';


/**
 * A default value for dimensions so unset values always are reported as
 * something. This is needed since Google Analytics will drop empty dimension
 * values in reports.
 */
const NULL_VALUE = '(not set)';

export function init(trackerId: string) {
    createTracker(trackerId)
    trackCustomDimensions()
    requireAutotrackPlugins()
    sendInitialPageview()
    sendNavigationTimingMetrics()
}

function createTracker(trackerId: string) {
    ga('create', trackerId);

    // Ensures all hits are sent via `navigator.sendBeacon()`.
    ga('set', 'transport', 'beacon');
}

function trackCustomDimensions() {
    // Sets a default dimension value for all custom dimensions to ensure
    // that every dimension in every hit has *some* value. This is necessary
    // because Google Analytics will drop rows with empty dimension values
    // in your reports.
    forOwn(Dimensions, (value) => {
        ga('set', value, NULL_VALUE)
    })

    // Adds tracking of dimensions known at page load time.
    ga((tracker: UniversalAnalytics.Tracker) => {
        tracker.set(Dimensions.TRACKING_VERSION, TRACKING_VERSION)
        tracker.set(Dimensions.CLIENT_ID, tracker.get('clientId'))
        tracker.set(Dimensions.WINDOW_ID, generateUuid())
    });

    // Adds tracking to record each the type, time, uuid, and visibility state
    // of each hit immediately before it's sent.
    ga((tracker: UniversalAnalytics.Tracker) => {
        const originalBuildHitTask: any = tracker.get('buildHitTask');
        tracker.set('buildHitTask', (model: any) => {
            model.set(Dimensions.HIT_ID, generateUuid(), true);
            model.set(Dimensions.HIT_TIME, String(+new Date), true);
            model.set(Dimensions.HIT_TYPE, model.get('hitType'), true);
            model.set(Dimensions.VISIBILITY_STATE, document.visibilityState, true);

            originalBuildHitTask(model);
        });
    });
}

function requireAutotrackPlugins() {
    ga('require', 'pageVisibilityTracker', {
        visibleMetricIndex: getDefinitionIndex(Metrics.PAGE_VISIBLE),
        sessionTimeout: 30,
        timeZone: 'America/Los_Angeles',
        fieldsObj: {[Dimensions.HIT_SOURCE]: 'pageVisibilityTracker'},
    });
    ga('require', 'cleanUrlTracker', {
        stripQuery: true,
        queryDimensionIndex: getDefinitionIndex(Dimensions.URL_QUERY_PARAMS),
        trailingSlash: 'remove',
        urlFieldsFilter: ((fieldsObj: any, parseUrl: any) => {
            // Strip media item index from room urls
            // TODO: include as dimension
            fieldsObj.page = parseUrl(fieldsObj.page).pathname
                .replace(/(\/r\/\S+)(\/\d+)/, '$1')
            return fieldsObj
        })
    })
}

function sendInitialPageview() {
    ga('send', 'pageview', {[Dimensions.HIT_SOURCE]: 'pageload'})
}

function sendNavigationTimingMetrics() {
    // Only track performance in supporting browsers.
    if (!(window.performance && window.performance.timing)) return;

    // If the window hasn't loaded, run this function after the `load` event.
    if (document.readyState != 'complete') {
        window.addEventListener('load', sendNavigationTimingMetrics);
        return;
    }

    const nt = performance.timing;
    const navStart = nt.navigationStart;

    const responseEnd = Math.round(nt.responseEnd - navStart);
    const domLoaded = Math.round(nt.domContentLoadedEventStart - navStart);
    const windowLoaded = Math.round(nt.loadEventStart - navStart);

    // In some edge cases browsers return very obviously incorrect NT values,
    // e.g. 0, negative, or future times. This validates values before sending.
    const allValuesAreValid = (...values: any[]) => {
        return values.every((value) => value > 0 && value < 6e6);
    };

    if (allValuesAreValid(responseEnd, domLoaded, windowLoaded)) {
        ga('send', 'event', {
            eventCategory: 'Navigation Timing',
            eventAction: 'track',
            nonInteraction: true,
            [Metrics.RESPONSE_END_TIME]: responseEnd,
            [Metrics.DOM_LOAD_TIME]: domLoaded,
            [Metrics.WINDOW_LOAD_TIME]: windowLoaded,
        });
    }
}

