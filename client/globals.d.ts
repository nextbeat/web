/// <reference types="google.analytics" />

declare var ga: UniversalAnalytics.ga

interface Require extends NodeRequire {
    ensure: any
}

declare var require: Require
