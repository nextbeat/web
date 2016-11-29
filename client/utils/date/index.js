import moment from 'moment'
import './locales/en-short'

export function shortFromNow(date, nowDate) {
    nowDate = nowDate || moment();
    var m = moment(date).locale('en-short')
    return m.from(nowDate);
}