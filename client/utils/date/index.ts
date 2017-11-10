import * as parse from 'date-fns/parse'
import * as format from 'date-fns/format'
import * as differenceInMonths from 'date-fns/difference_in_months'
import * as differenceInYears from 'date-fns/difference_in_years'
import * as distanceInWordsStrict from 'date-fns/distance_in_words_strict'

import assign from 'lodash-es/assign'

interface FormatOptions {
    format: 'short' | 'long'
}

const defaultOptions = {
    format: 'long'
}

let FORMAT_SHORT = {
    s: "%ds",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1mo",
    MM: "%dmo",
    y: "1y",
    yy: "%dy"
}

let FORMAT_LONG = {
    s: "a few seconds",
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years"
}

let FORMATS = {
    long: FORMAT_LONG,
    short: FORMAT_SHORT
}

type DirtyDate = string | number | Date

// TODO: test time zones!
// Uses the logic of moment's relative time formatting 
// but without the 400KB library!
export function fromString(dirtyDateLeft: DirtyDate, dirtyDateRight: DirtyDate, _options?: FormatOptions) {
    let dateLeft = parse(dirtyDateLeft)
    let dateRight = parse(dirtyDateRight)

    let options = assign({}, defaultOptions, _options) as FormatOptions

    function format(key: string, count: number) {
        return (FORMATS[options.format] as any)[key].replace(/\%d/g, count)
    }

    let seconds = Math.abs(Math.floor((dateRight.getTime() - dateLeft.getTime())/1000))
    if (seconds < 45) {
        return format('s', seconds)
    } else if (seconds < 90) {
        return format('m', 1)
    }
    
    let minutes = Math.max(2, Math.floor(seconds / 60))
    if (minutes < 44) {
        return format('mm', minutes)
    } else if (minutes < 89) {
        return format('h', 1)
    }

    let hours = Math.floor(minutes / 60)
    if (hours < 21) {
        return format('hh', hours)
    } else if (hours < 35) {
        return format('d', 1)
    }

    let days = Math.max(2, Math.floor(hours / 24))
    let months = Math.max(2, Math.abs(differenceInMonths(dateLeft, dateRight)))
    let years = Math.max(2, Math.abs(differenceInYears(dateLeft, dateRight)))
    if (days < 25) {
        return format('dd', days)
    } else if (days < 45) {
        return format('M', 1)
    } else if (days < 320) {
        return format('MM', months)
    } else if (days < 548) {
        return format('y', 1)
    } else {
        return format('yy', years)
    }
}

export function fromNowString(dirtyDate: DirtyDate, options?: FormatOptions) {
    return fromString(dirtyDate, new Date(), options)
}

export function timeLeftString(dirtyDate: DirtyDate, options?: FormatOptions) {
    let date = parse(dirtyDate)
    let now = new Date()

    let seconds = Math.abs(Math.floor((date.getTime() - now.getTime())/1000))
    if (seconds < 3600) {
        return `${distanceInWordsStrict(date, now, { unit: 'm' })} left`
    } else {
        return `${distanceInWordsStrict(date, now, { unit: 'h' })} left`
    }
}

export function timeString(dirtyDate: DirtyDate) {
    let date = parse(dirtyDate)
    return format(date, 'h:mm a')
}