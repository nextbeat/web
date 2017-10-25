/// <reference types="google.analytics" />

declare module 'hoist-non-react-statics';
declare module 'linkifyjs/html';

declare var ga: UniversalAnalytics.ga

interface Require extends NodeRequire {
    ensure: any
}

declare var require: Require
