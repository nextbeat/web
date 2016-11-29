import moment from 'moment'
import './locales/en-short'

export function shortFromNow(date) {
    var m = moment(date).locale('en-short')
    return m.fromNow();
}