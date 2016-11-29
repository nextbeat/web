import moment from 'moment'

moment.defineLocale('en-short', {
    parentLocale: 'en',

    relativeTime: {
        future: "%s",
        past: "%s",
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
});

moment.locale('en');